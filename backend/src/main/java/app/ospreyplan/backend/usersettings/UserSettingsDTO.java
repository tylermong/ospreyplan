package app.ospreyplan.backend.usersettings;

public class UserSettingsDTO
{
    private String degree;
    private short startYear;

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
}
