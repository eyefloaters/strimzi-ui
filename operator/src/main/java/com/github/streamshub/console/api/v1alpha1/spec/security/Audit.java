package com.github.streamshub.console.api.v1alpha1.spec.security;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;

import io.fabric8.generator.annotation.Required;
import io.sundr.builder.annotations.Buildable;

@Buildable(editableEnabled = false)
public class Audit extends Rule {

    @Required
    Decision decision;

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public enum Decision {

        ALLOWED {
            @Override
            public boolean logResult(boolean allowed) {
                return allowed;
            }
        },

        DENIED {
            @Override
            public boolean logResult(boolean allowed) {
                return !allowed;
            }
        },

        ALL {
            @Override
            public boolean logResult(boolean allowed) {
                return true;
            }
        };

        public abstract boolean logResult(boolean allowed);

        @JsonCreator
        public static Decision forValue(String value) {
            if ("*".equals(value)) {
                return ALL;
            }
            return valueOf(value.toUpperCase(Locale.ROOT));
        }
    }

}
