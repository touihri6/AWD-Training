package com.awd.candidat.client;

import com.awd.candidat.dto.JobResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "JOB")
public interface JobClient {

    @GetMapping("/mic2/jobs")
    List<JobResponse> getAllJobs();

    @GetMapping("/mic2/jobs/{id}")
    JobResponse getJobById(@PathVariable("id") Long id);
}
