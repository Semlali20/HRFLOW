package com.innovx.gestionrh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Lightweight id+name pair used as a nested reference in other responses. */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RefSummary {
    private Long id;
    private String name;
}
