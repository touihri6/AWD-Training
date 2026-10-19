package esprit.canditature.dto;

import java.time.LocalDate;

public record JobResponse(
        Long id,
        String name,
        String description,
        boolean available,
        LocalDate date,
        CategoryResponse category
) {
}
