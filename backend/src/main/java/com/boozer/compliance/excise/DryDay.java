package com.boozer.compliance.excise;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DryDay {
    private LocalDate date;
    private String reason;
    private String state;
    private String statutorySection;
    private boolean isMandatoryStatewide;
}
