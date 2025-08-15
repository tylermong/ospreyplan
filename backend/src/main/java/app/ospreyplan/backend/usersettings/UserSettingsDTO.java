package app.ospreyplan.backend.usersettings;

public class UserSettingsDTO
{
    private String degree;
    private Integer startYear;

    public String getDegree()
    {
        return degree;
    }

    public void setDegree(String degree)
    {
        this.degree = degree;
    }

    public Integer getStartYear()
    {
        return startYear;
    }

    public void setStartYear(Integer startYear)
    {
        this.startYear = startYear;
    }
}
