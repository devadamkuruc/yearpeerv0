using System.ComponentModel.DataAnnotations;
using YearPeerV0.Models.DAL;

namespace YearPeerV0.Validation;

public class DateRangeAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var goal = validationContext.ObjectInstance as Goal;
        if (goal == null)
            return new ValidationResult("Invalid object type");

        if (goal.EndDate < goal.StartDate)
        {
            return new ValidationResult("End date must be after start date");
        }

        return ValidationResult.Success;
    }
}