package com.github.eyefloaters.console.api.errors.server;

import java.util.List;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import org.apache.kafka.common.errors.TimeoutException;
import org.jboss.logging.Logger;

import com.github.eyefloaters.console.api.model.Error;
import com.github.eyefloaters.console.api.model.ErrorResponse;
import com.github.eyefloaters.console.api.support.ErrorCategory;

@Provider
public class TimeoutExceptionHandler implements ExceptionMapper<TimeoutException> {

    private static final Logger LOGGER = Logger.getLogger(TimeoutExceptionHandler.class);
    private static final ErrorCategory CATEGORY = ErrorCategory.get(ErrorCategory.BackendTimeout.class);

    @Override
    public Response toResponse(TimeoutException exception) {
        Error error = CATEGORY.createError(exception.getMessage(), exception, null);
        LOGGER.warnf(exception, "error=%s", error);

        return Response.status(CATEGORY.getHttpStatus())
                .entity(new ErrorResponse(List.of(error)))
                .build();
    }

}
