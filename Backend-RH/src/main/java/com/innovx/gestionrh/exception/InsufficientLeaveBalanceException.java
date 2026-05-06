package com.innovx.gestionrh.exception;

public class InsufficientLeaveBalanceException extends BusinessException {

    public InsufficientLeaveBalanceException(int requested, int available) {
        super("INSUFFICIENT_LEAVE_BALANCE",
              String.format("Insufficient leave balance: requested %d day(s) but only %d day(s) remaining.",
                            requested, available));
    }
}
