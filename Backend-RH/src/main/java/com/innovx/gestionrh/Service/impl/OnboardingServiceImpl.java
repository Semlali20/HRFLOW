package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.Service.OnboardingService;
import com.innovx.gestionrh.dto.request.OnboardingProcessRequest;
import com.innovx.gestionrh.dto.response.OnboardingProcessResponse;
import com.innovx.gestionrh.dto.response.OnboardingTaskResponse;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OnboardingServiceImpl implements OnboardingService {

    private final OnboardingProcessRepository processRepository;
    private final OnboardingTemplateRepository templateRepository;
    private final CollaborateursRepository collaborateursRepository;

    @Override
    @Transactional
    public OnboardingProcessResponse start(OnboardingProcessRequest req) {
        Collaborateurs collab = collaborateursRepository.findById(req.getCollaborateurId())
                .orElseThrow(() -> new ResourceNotFoundException("Collaborateur", "id", req.getCollaborateurId()));

        OnboardingProcess process = OnboardingProcess.builder()
                .collaborateur(collab)
                .type(req.getType())
                .startDate(req.getStartDate())
                .targetEndDate(req.getTargetEndDate())
                .status(OnboardingProcess.ProcessStatus.IN_PROGRESS)
                .tasks(new ArrayList<>())
                .build();

        List<OnboardingTask> tasks;
        if (req.getTemplateId() != null) {
            OnboardingTemplate template = templateRepository.findById(req.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("OnboardingTemplate", "id", req.getTemplateId()));
            tasks = buildTasksFromTemplate(process, template, req.getStartDate());
        } else {
            tasks = buildDefaultTasks(process, req.getStartDate());
        }
        process.setTasks(tasks);

        OnboardingProcess saved = processRepository.save(process);
        log.info("Started {} process for collaborateur id={}", req.getType(), req.getCollaborateurId());
        return toResponse(saved);
    }

    @Override
    public OnboardingProcessResponse getById(Long id) {
        return toResponse(findProcess(id));
    }

    @Override
    public Page<OnboardingProcessResponse> getAll(Pageable pageable) {
        return processRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public List<OnboardingProcessResponse> getByCollaborateur(Long collaborateurId) {
        if (!collaborateursRepository.existsById(collaborateurId)) {
            throw new ResourceNotFoundException("Collaborateur", "id", collaborateurId);
        }
        return processRepository.findByCollaborateurId(collaborateurId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OnboardingProcessResponse completeTask(Long processId, Long taskId, String notes) {
        OnboardingProcess process = findProcess(processId);
        OnboardingTask task = process.getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("OnboardingTask", "id", taskId));

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            task.setNotes(notes);
        }

        // Auto-complete process if all tasks done
        boolean allDone = process.getTasks().stream().allMatch(OnboardingTask::isCompleted);
        if (allDone) {
            process.setStatus(OnboardingProcess.ProcessStatus.COMPLETED);
            log.info("Process id={} completed — all tasks done", processId);
        }

        return toResponse(processRepository.save(process));
    }

    @Override
    @Transactional
    public OnboardingProcessResponse uncompleteTask(Long processId, Long taskId) {
        OnboardingProcess process = findProcess(processId);
        OnboardingTask task = process.getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("OnboardingTask", "id", taskId));

        task.setCompleted(false);
        task.setCompletedAt(null);

        // Reopen process if it was completed
        if (process.getStatus() == OnboardingProcess.ProcessStatus.COMPLETED) {
            process.setStatus(OnboardingProcess.ProcessStatus.IN_PROGRESS);
        }

        return toResponse(processRepository.save(process));
    }

    @Override
    @Transactional
    public void cancel(Long id) {
        OnboardingProcess process = findProcess(id);
        process.setStatus(OnboardingProcess.ProcessStatus.CANCELLED);
        processRepository.save(process);
        log.info("Cancelled onboarding process id={}", id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private OnboardingProcess findProcess(Long id) {
        return processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OnboardingProcess", "id", id));
    }

    private List<OnboardingTask> buildTasksFromTemplate(OnboardingProcess process, OnboardingTemplate template, LocalDate startDate) {
        List<OnboardingTask> tasks = new ArrayList<>();
        for (OnboardingTaskTemplate tt : template.getTasks()) {
            tasks.add(OnboardingTask.builder()
                    .process(process)
                    .title(tt.getTitle())
                    .description(tt.getDescription())
                    .assignedTo(tt.getAssignedTo())
                    .orderIndex(tt.getOrderIndex())
                    .dueDate(startDate.plusDays(tt.getDueDaysOffset()))
                    .completed(false)
                    .build());
        }
        return tasks;
    }

    private List<OnboardingTask> buildDefaultTasks(OnboardingProcess process, LocalDate startDate) {
        record DefaultTask(String title, String assignedTo, int dayOffset) {}
        List<DefaultTask> defaults = List.of(
                new DefaultTask("Account Setup",          "IT",       0),
                new DefaultTask("Welcome Meeting",        "HR",       1),
                new DefaultTask("Equipment Handover",     "IT",       1),
                new DefaultTask("Benefits Enrollment",    "HR",       3),
                new DefaultTask("Department Introduction","MANAGER",  3),
                new DefaultTask("System Access Setup",    "IT",       5)
        );

        List<OnboardingTask> tasks = new ArrayList<>();
        int idx = 0;
        for (DefaultTask dt : defaults) {
            tasks.add(OnboardingTask.builder()
                    .process(process)
                    .title(dt.title())
                    .assignedTo(dt.assignedTo())
                    .orderIndex(idx++)
                    .dueDate(startDate.plusDays(dt.dayOffset()))
                    .completed(false)
                    .build());
        }
        return tasks;
    }

    private OnboardingProcessResponse toResponse(OnboardingProcess p) {
        List<OnboardingTaskResponse> taskResponses = p.getTasks().stream()
                .sorted((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                .map(t -> OnboardingTaskResponse.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .assignedTo(t.getAssignedTo())
                        .orderIndex(t.getOrderIndex())
                        .dueDate(t.getDueDate())
                        .completed(t.isCompleted())
                        .completedAt(t.getCompletedAt())
                        .notes(t.getNotes())
                        .overdue(!t.isCompleted() && t.getDueDate().isBefore(LocalDate.now()))
                        .build())
                .collect(Collectors.toList());

        String collaborateurName = p.getCollaborateur().getFirstName() + " " + p.getCollaborateur().getLastName();

        return OnboardingProcessResponse.builder()
                .id(p.getId())
                .collaborateurId(p.getCollaborateur().getId())
                .collaborateurName(collaborateurName)
                .type(p.getType())
                .startDate(p.getStartDate())
                .targetEndDate(p.getTargetEndDate())
                .status(p.getStatus().name())
                .completedCount(p.getCompletedCount())
                .totalCount(p.getTasks().size())
                .progressPercent(p.getProgressPercent())
                .tasks(taskResponses)
                .build();
    }
}
