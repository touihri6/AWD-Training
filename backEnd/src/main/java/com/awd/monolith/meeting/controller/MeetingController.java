package com.awd.monolith.meeting.controller;

import com.awd.monolith.meeting.dto.MeetingRequest;
import com.awd.monolith.meeting.dto.MeetingResponse;
import com.awd.monolith.meeting.dto.MeetingStatusRequest;
import com.awd.monolith.meeting.entity.MeetingStatus;
import com.awd.monolith.meeting.service.MeetingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@Tag(name = "Meetings", description = "Interviews linked to candidatures")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    @Operation(summary = "List meetings", description = "Optionally filtered by status.")
    @ApiResponse(responseCode = "200", description = "List of meetings")
    public List<MeetingResponse> findAll(
            @Parameter(description = "Only meetings with this status") @RequestParam(required = false) MeetingStatus status) {
        return meetingService.search(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a meeting by id")
    @ApiResponse(responseCode = "200", description = "Meeting found")
    @ApiResponse(responseCode = "404", description = "Meeting not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public MeetingResponse findById(@Parameter(description = "Meeting id", example = "1") @PathVariable Long id) {
        return meetingService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Schedule a meeting",
            description = "The reference must be unique and a candidature can have only one meeting.")
    @ApiResponse(responseCode = "201", description = "Meeting created")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Candidature not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Reference already used, or candidature already has a meeting",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<MeetingResponse> create(@Valid @RequestBody MeetingRequest request) {
        MeetingResponse created = meetingService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a meeting")
    @ApiResponse(responseCode = "200", description = "Meeting updated")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Meeting or candidature not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Conflict on reference/candidature, or status transition not allowed",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public MeetingResponse update(@Parameter(description = "Meeting id", example = "1") @PathVariable Long id,
                                  @Valid @RequestBody MeetingRequest request) {
        return meetingService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change the status of a meeting",
            description = "SCHEDULED can move to HELD or CANCELLED; HELD and CANCELLED are final.")
    @ApiResponse(responseCode = "200", description = "Status updated")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Meeting not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Status transition not allowed",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public MeetingResponse updateStatus(@Parameter(description = "Meeting id", example = "1") @PathVariable Long id,
                                        @Valid @RequestBody MeetingStatusRequest request) {
        return meetingService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a meeting")
    @ApiResponse(responseCode = "204", description = "Meeting deleted")
    @ApiResponse(responseCode = "404", description = "Meeting not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<Void> delete(@Parameter(description = "Meeting id", example = "1") @PathVariable Long id) {
        meetingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
