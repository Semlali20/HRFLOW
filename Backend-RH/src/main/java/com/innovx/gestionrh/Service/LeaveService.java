package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.LeaveBalance;
import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.LeaveType;

import java.time.LocalDate;
import java.util.List;

public interface LeaveService {

    List<LeaveType> getActiveLeaveTypes();

    LeaveType createLeaveType(LeaveType leaveType);

    List<LeaveRequest> getAllRequests();

    List<LeaveRequest> getMyRequests(Long userId);

    List<LeaveRequest> getPendingRequests();

    LeaveRequest submitRequest(Long requesterId, Long leaveTypeId,
                               LocalDate start, LocalDate end, String reason);

    LeaveRequest approve(Long requestId, Long approverId, String comment);

    LeaveRequest reject(Long requestId, Long approverId, String comment);

    List<LeaveBalance> getMyBalances(Long userId);
}
