package com.github.eyefloaters.console.api.support;

import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import jakarta.validation.Payload;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.Response.StatusType;

import com.github.eyefloaters.console.api.model.Error;
import com.github.eyefloaters.console.api.model.ErrorSource;
import com.github.eyefloaters.console.api.model.ListFetchParams;

public abstract class ErrorCategory implements Payload {

    private static final Map<Class<? extends ErrorCategory>, ErrorCategory> INSTANCES = Stream.of(
            new InvalidQueryParameter(),
            new MaxPageSizeExceededError(),
            new ResourceNotFound(),
            new ServerError(),
            new BackendTimeout())
        .collect(Collectors.toMap(ErrorCategory::getClass, Function.identity()));

    @SuppressWarnings("unchecked")
    public static <T extends ErrorCategory> T get(Class<? extends Payload> type) {
        return (T) INSTANCES.get(type);
    }

    public static class InvalidQueryParameter extends ErrorCategory {
        public InvalidQueryParameter() {
            super("4001", "Invalid query parameter", Status.BAD_REQUEST, Source.PARAMETER);
        }
    }

    /**
     * Special case HTTP 400 error for when the `page[size]` parameter exceeds the
     * server-defined limit.
     *
     * @see <a href=
     *      "https://jsonapi.org/profiles/ethanresnick/cursor-pagination/#errors-max-page-size-exceeded">Max
     *      Page Size Exceeded Error</a>
     */
    public static class MaxPageSizeExceededError extends ErrorCategory {
        public static final String TYPE_LINK = "https://jsonapi.org/profiles/ethanresnick/cursor-pagination/max-size-exceeded";

        public MaxPageSizeExceededError() {
            super("4002", "Requested page size exceeds limit", Status.BAD_REQUEST, Source.PARAMETER);
        }

        @Override
        public Error createError(String message, Throwable cause, String property) {
            Error error = super.createError(message, cause, property);
            error.addMeta("page", Map.of("maxSize", ListFetchParams.PAGE_SIZE_MAX));
            error.addLink("type", TYPE_LINK);
            return error;
        }
    }

    public static class ResourceNotFound extends ErrorCategory {
        public ResourceNotFound() {
            super("4041", "Resource not found", Status.NOT_FOUND);
        }
    }

    public static class ServerError extends ErrorCategory {
        public ServerError() {
            super("5001", "Unexpected error", Status.INTERNAL_SERVER_ERROR);
        }
    }

    public static class BackendTimeout extends ErrorCategory {
        public BackendTimeout() {
            super("5041", "Timed out waiting for backend service", Status.GATEWAY_TIMEOUT);
        }
    }

    public enum Source {
        PARAMETER {
            @Override
            public ErrorSource errorSource(String reference) {
                return new ErrorSource(null, reference, null);
            }
        },
        POINTER {
            @Override
            public ErrorSource errorSource(String reference) {
                return new ErrorSource(reference, null, null);
            }
        },
        HEADER {
            @Override
            public ErrorSource errorSource(String reference) {
                return new ErrorSource(null, null, reference);
            }
        },
        NONE {
            @Override
            public ErrorSource errorSource(String reference) {
                return null;
            }
        };

        public abstract ErrorSource errorSource(String reference);
    }

    private String title;
    private StatusType httpStatus;
    private String code;
    private Source source;

    private ErrorCategory(String code, String title, StatusType httpStatus, Source source) {
        this.code = code;
        this.title = title;
        this.httpStatus = httpStatus;
        this.source = source;
    }

    private ErrorCategory(String code, String title, StatusType httpStatus) {
        this(code, title, httpStatus, Source.NONE);
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public StatusType getHttpStatus() {
        return httpStatus;
    }

    public Source getSource() {
        return source;
    }

    public Error createError(String message, Throwable cause, String property) {
        Error error = new Error(getTitle(), message, cause);
        error.setStatus(String.valueOf(getHttpStatus().getStatusCode()));
        error.setCode(getCode());
        error.setSource(getSource().errorSource(property));
        error.setId(UUID.randomUUID().toString());

        return error;
    }
}
