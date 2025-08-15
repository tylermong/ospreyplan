package app.ospreyplan.backend.usersettings;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserSettings
{
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @Column(name = "degree")
    private String degree;
    
    @Column(name = "start_year")
    private short startYear;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public UUID getId()
    {
        return id;
    }

    public void setId(UUID id)
    {
        this.id = id;
    }

    public String getFullName()
    {
        return fullName;
    }

    public void setFullName(String fullName)
    {
        this.fullName = fullName;
    }

    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public String getProfilePictureUrl()
    {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl)
    {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getDegree()
    {
        return degree;
    }

    public void setDegree(String degree)
    {
        this.degree = degree;
    }

    public short getStartYear()
    {
        return startYear;
    }

    public void setStartYear(short startYear)
    {
        this.startYear = startYear;
    }

    public OffsetDateTime getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt)
    {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt()
    {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt)
    {
        this.updatedAt = updatedAt;
    }
}
