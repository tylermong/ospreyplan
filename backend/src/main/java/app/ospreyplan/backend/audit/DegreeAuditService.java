package app.ospreyplan.backend.audit;

import app.ospreyplan.backend.courses.Course;
import app.ospreyplan.backend.courses.CourseId;
import app.ospreyplan.backend.courses.CourseRepository;
import app.ospreyplan.backend.planner.course.PlannedCourse;
import app.ospreyplan.backend.planner.course.PlannedCourseRepository;
import app.ospreyplan.backend.usersettings.UserSettings;
import app.ospreyplan.backend.usersettings.UserSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DegreeAuditService {

    private final DegreeRequirementRepository degreeRequirementRepository;
    private final PlannedCourseRepository plannedCourseRepository;
    private final CourseRepository courseRepository;
    private final UserSettingsRepository userSettingsRepository;

    public DegreeAuditService(DegreeRequirementRepository degreeRequirementRepository,
                              PlannedCourseRepository plannedCourseRepository,
                              CourseRepository courseRepository,
                              UserSettingsRepository userSettingsRepository) {
        this.degreeRequirementRepository = degreeRequirementRepository;
        this.plannedCourseRepository = plannedCourseRepository;
        this.courseRepository = courseRepository;
        this.userSettingsRepository = userSettingsRepository;
    }

    private boolean isOverlayCategory(String category) {
        return "ATTRIBUTE".equals(category) || 
               "Attribute Requirements".equals(category) ||
               "Writing Requirements".equals(category) ||
               "Quantitative Requirement".equals(category) ||
               "Race and Racism Education".equals(category);
    }

    public DegreeAuditResponse audit(UUID userId) {
        UserSettings user = userSettingsRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String degreeCode = user.getDegree();
        if (degreeCode == null) {
            return new DegreeAuditResponse(null, Collections.emptyList());
        }

        List<DegreeRequirement> requirements = degreeRequirementRepository.findByDegreeCodeOrderByPriorityAsc(degreeCode);
        List<PlannedCourse> allPlannedCourses = plannedCourseRepository.findByPlannedSemester_UserIdOrderByCreatedAtAsc(userId);

        // Deduplicate courses: Keep only one instance of each (Subject + Number), preferring higher credits
        Map<String, PlannedCourse> uniqueCoursesMap = new HashMap<>();
        for (PlannedCourse pc : allPlannedCourses) {
            String key = pc.getSubject() + "-" + pc.getCourseNumber();
            if (!uniqueCoursesMap.containsKey(key)) {
                uniqueCoursesMap.put(key, pc);
            } else {
                PlannedCourse existing = uniqueCoursesMap.get(key);
                if (pc.getCredits() > existing.getCredits()) {
                    uniqueCoursesMap.put(key, pc);
                }
            }
        }
        List<PlannedCourse> plannedCourses = new ArrayList<>(uniqueCoursesMap.values());

        // Map PlannedCourse to Course details
        Map<UUID, Course> courseDetailsMap = new HashMap<>();
        for (PlannedCourse pc : plannedCourses) {
            CourseId courseId = new CourseId();
            courseId.setSubject(pc.getSubject());
            courseId.setCourseNumber(pc.getCourseNumber());
            
            courseRepository.findById(courseId).ifPresent(c -> courseDetailsMap.put(pc.getId(), c));
        }

        // Initialize results
        List<DegreeAuditResult> results = requirements.stream()
                .map(r -> new DegreeAuditResult(r.getName(), r.getCategory(), r.getRequiredCount()))
                .collect(Collectors.toList());
        
        // Map requirement ID to result index for easy access
        Map<String, Integer> reqIdToIndex = new HashMap<>();
        for (int i = 0; i < requirements.size(); i++) {
            reqIdToIndex.put(requirements.get(i).getId(), i);
        }

        Set<UUID> consumedPlannedCourseIds = new HashSet<>();

        // Pass 0: Grouped Requirements (AND logic within groups)
        for (DegreeRequirement req : requirements) {
            if (isOverlayCategory(req.getCategory()) || "ASD".equals(req.getCategory()) || "CATCH_ALL".equals(req.getCategory())) continue;

            DegreeAuditResult result = results.get(reqIdToIndex.get(req.getId()));
            if (result.getSatisfiedBy().size() >= req.getRequiredCount()) continue;

            Map<String, List<RequirementCriteria>> groups = req.getCriteria().stream()
                    .filter(c -> c.getGroupId() != null)
                    .collect(Collectors.groupingBy(RequirementCriteria::getGroupId));

            for (Map.Entry<String, List<RequirementCriteria>> entry : groups.entrySet()) {
                List<RequirementCriteria> groupCriteria = entry.getValue();
                List<PlannedCourse> groupMatches = new ArrayList<>();
                boolean groupSatisfied = true;
                Set<UUID> tempConsumed = new HashSet<>();

                for (RequirementCriteria criteria : groupCriteria) {
                    boolean criteriaMet = false;
                    for (PlannedCourse pc : plannedCourses) {
                        if (consumedPlannedCourseIds.contains(pc.getId()) || tempConsumed.contains(pc.getId())) continue;
                        
                        Course course = courseDetailsMap.get(pc.getId());
                        if (course != null && matchesCriteria(course, criteria)) {
                            groupMatches.add(pc);
                            tempConsumed.add(pc.getId());
                            criteriaMet = true;
                            break;
                        }
                    }
                    if (!criteriaMet) {
                        groupSatisfied = false;
                        break;
                    }
                }

                if (groupSatisfied) {
                    for (PlannedCourse pc : groupMatches) {
                        Course c = courseDetailsMap.get(pc.getId());
                        result.getSatisfiedBy().add(toDTO(pc, c));
                        consumedPlannedCourseIds.add(pc.getId());
                    }
                    if (result.getSatisfiedBy().size() >= req.getRequiredCount()) break;
                }
            }
        }

        // Pass 1: Primary (MAJOR, GEN_ED)
        for (PlannedCourse pc : plannedCourses) {
            Course course = courseDetailsMap.get(pc.getId());
            if (course == null) continue;

            for (DegreeRequirement req : requirements) {
                // Skip Attributes and Catch-All in Pass 1
                if (isOverlayCategory(req.getCategory()) || "ASD".equals(req.getCategory()) || "CATCH_ALL".equals(req.getCategory())) continue;
                
                DegreeAuditResult result = results.get(reqIdToIndex.get(req.getId()));
                if (result.getSatisfiedBy().size() >= req.getRequiredCount()) continue;

                if (matches(course, req.getCriteria())) {
                    result.getSatisfiedBy().add(toDTO(pc, course));
                    consumedPlannedCourseIds.add(pc.getId());
                    break; // Consumed by this requirement
                }
            }
        }

        // Pass 2: Attributes (ATTRIBUTE)
        for (PlannedCourse pc : plannedCourses) {
            Course course = courseDetailsMap.get(pc.getId());
            if (course == null) continue;

            for (DegreeRequirement req : requirements) {
                if (!isOverlayCategory(req.getCategory())) continue;

                DegreeAuditResult result = results.get(reqIdToIndex.get(req.getId()));
                if (result.getSatisfiedBy().size() >= req.getRequiredCount()) continue;

                if (matches(course, req.getCriteria())) {
                    boolean alreadyAdded = result.getSatisfiedBy().stream()
                            .anyMatch(dto -> dto.getSubject().equals(pc.getSubject()) && 
                                             dto.getCourseNumber().equals(pc.getCourseNumber()));
                    
                    if (!alreadyAdded) {
                        result.getSatisfiedBy().add(toDTO(pc, course));
                    }
                }
            }
        }

        // Pass 3: Catch-all (ASD)
        DegreeRequirement catchAllReq = requirements.stream()
                .filter(r -> "CATCH_ALL".equals(r.getCategory()) || "ASD".equals(r.getCategory()))
                .findFirst().orElse(null);

        if (catchAllReq != null) {
            DegreeAuditResult result = results.get(reqIdToIndex.get(catchAllReq.getId()));
            for (PlannedCourse pc : plannedCourses) {
                if (!consumedPlannedCourseIds.contains(pc.getId())) {
                    Course course = courseDetailsMap.get(pc.getId());
                    if (course != null) {
                         result.getSatisfiedBy().add(toDTO(pc, course));
                    }
                }
            }
        }

        // Populate missing criteria descriptions
        for (int i = 0; i < results.size(); i++) {
            DegreeAuditResult result = results.get(i);
            DegreeRequirement req = requirements.get(i);

            int missingCount = req.getRequiredCount() - result.getSatisfiedBy().size();
            if (missingCount > 0) {
                List<String> descriptions = new ArrayList<>();

                // Groups
                req.getCriteria().stream()
                        .filter(c -> c.getGroupId() != null)
                        .collect(Collectors.groupingBy(RequirementCriteria::getGroupId))
                        .values()
                        .forEach(group -> {
                            String groupDesc = group.stream()
                                    .map(this::generateMissingCriteriaDescription)
                                    .collect(Collectors.joining(" + "));
                            descriptions.add(groupDesc);
                        });

                // Singles
                req.getCriteria().stream()
                        .filter(c -> c.getGroupId() == null)
                        .forEach(c -> descriptions.add(generateMissingCriteriaDescription(c)));

                String criteriaDesc = String.join(", ", descriptions);

                for (int j = 0; j < missingCount; j++) {
                    result.getMissingCriteria().add(criteriaDesc);
                }
            }
        }

        return new DegreeAuditResponse(degreeCode, results);
    }

    private String generateMissingCriteriaDescription(RequirementCriteria criteria) {
        if ("COURSE".equals(criteria.getType())) {
            return criteria.getSubject() + " " + criteria.getCourseNumber();
        } else if ("RANGE".equals(criteria.getType())) {
            return criteria.getSubject() + " " + criteria.getMinLevel() + "+";
        } else if ("SUBJECT".equals(criteria.getType())) {
            return "Any " + criteria.getSubject() + " Course";
        } else if ("ATTRIBUTE".equals(criteria.getType())) {
            String desc = criteria.getAttribute();
            if (criteria.getMinLevel() != null) {
                desc += " (" + criteria.getMinLevel() + "+)";
            }
            return desc;
        } else if ("CATCH_ALL".equals(criteria.getType())) {
            return "Any Course";
        }
        return "Unknown Requirement";
    }

    private boolean matches(Course course, List<RequirementCriteria> criteriaList) {
        for (RequirementCriteria criteria : criteriaList) {
            if (criteria.getGroupId() != null) continue; // Skip grouped criteria
            if (matchesCriteria(course, criteria)) return true;
        }
        return false;
    }

    private boolean matchesCriteria(Course course, RequirementCriteria criteria) {
        if ("COURSE".equals(criteria.getType())) {
            // Specific Course Match (Subject + Number)
            if (criteria.getSubject() != null && !criteria.getSubject().equals(course.getCourseId().getSubject())) return false;
            if (criteria.getCourseNumber() != null && !criteria.getCourseNumber().equals(course.getCourseId().getCourseNumber().intValue())) return false;
            return true;
        } else if ("RANGE".equals(criteria.getType())) {
            // Range Match (Subject + Min Level)
            if (criteria.getSubject() != null && !criteria.getSubject().equals(course.getCourseId().getSubject())) return false;
            if (criteria.getMinLevel() != null && course.getCourseId().getCourseNumber() < criteria.getMinLevel()) return false;
            return true;
        } else if ("SUBJECT".equals(criteria.getType())) {
            // Subject Match (Any course with this subject)
            if (criteria.getSubject() != null && !criteria.getSubject().equals(course.getCourseId().getSubject())) return false;
            return true;
        } else if ("ATTRIBUTE".equals(criteria.getType())) {
            // Attribute Match (Attribute + Optional Min Level)
            if (criteria.getAttribute() != null) {
                if (course.getAttributes() == null || !course.getAttributes().contains(criteria.getAttribute())) return false;
            }
            if (criteria.getMinLevel() != null) {
                if (course.getCourseId().getCourseNumber() < criteria.getMinLevel()) return false;
            }
            return true;
        } else if ("CATCH_ALL".equals(criteria.getType())) {
            return true;
        }
        return false;
    }

    private CourseDTO toDTO(PlannedCourse pc, Course c) {
        return new CourseDTO(pc.getSubject(), pc.getCourseNumber(), pc.getCredits(), c.getName());
    }
}
