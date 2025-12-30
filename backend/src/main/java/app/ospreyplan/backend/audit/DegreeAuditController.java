package app.ospreyplan.backend.audit;

import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class DegreeAuditController {

    private final DegreeAuditService degreeAuditService;

    public DegreeAuditController(DegreeAuditService degreeAuditService) {
        this.degreeAuditService = degreeAuditService;
    }

    @GetMapping("/{userId}")
    public DegreeAuditResponse getAudit(@PathVariable UUID userId) {
        return degreeAuditService.audit(userId);
    }
}
