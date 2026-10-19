package com.awd.candidat.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "JobCategory", description = "Category of a job, read from the job microservice")
public record CategoryResponse(

        @Schema(example = "1")
        Long id,

        @Schema(example = "Software Development")
        String name,

        @Schema(example = "Backend, frontend and mobile development jobs")
        String description
) {
}
