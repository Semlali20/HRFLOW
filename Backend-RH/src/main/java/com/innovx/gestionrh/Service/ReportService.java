package com.innovx.gestionrh.Service;

import java.io.IOException;
import java.util.Map;

public interface ReportService {

    Map<String, Object> getKpiDashboard();

    byte[] exportEmployeesExcel() throws IOException;

    byte[] exportInternsExcel() throws IOException;

    byte[] exportEmployeesPdf() throws IOException;
}
