package com.github.eyefloaters.console.api;

import java.util.List;
import java.util.concurrent.CompletionStage;
import java.util.function.Consumer;

import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.validation.Valid;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;

import org.eclipse.microprofile.openapi.annotations.enums.Explode;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponseSchema;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.github.eyefloaters.console.api.model.ListFetchParams;
import com.github.eyefloaters.console.api.model.NewTopic;
import com.github.eyefloaters.console.api.model.Topic;
import com.github.eyefloaters.console.api.model.TopicPatch;
import com.github.eyefloaters.console.api.service.TopicService;
import com.github.eyefloaters.console.api.support.ErrorCategory;
import com.github.eyefloaters.console.api.support.FieldFilter;
import com.github.eyefloaters.console.api.support.KafkaOffsetSpec;
import com.github.eyefloaters.console.api.support.KafkaUuid;
import com.github.eyefloaters.console.api.support.ListRequestContext;
import com.github.eyefloaters.console.api.support.StringEnumeration;

@Path("/api/kafkas/{clusterId}/topics")
@Tag(name = "Kafka Cluster Resources")
public class TopicsResource {

    static final String FIELDS_PARAM = "fields[topics]";

    @Inject
    UriInfo uriInfo;

    @Inject
    TopicService topicService;

    /**
     * Allows the value of {@link FieldFilter#requestedFields} to be set for
     * the request.
     */
    @Inject
    @Named("requestedFields")
    Consumer<List<String>> requestedFields;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponse(responseCode = "200",
        description = "New topic successfully validated, nothing was created",
        content = @Content(schema = @Schema(implementation = NewTopic.NewTopicDocument.class)))
    @APIResponse(responseCode = "201",
        description = "New topic successfully created",
        content = @Content(schema = @Schema(implementation = NewTopic.NewTopicDocument.class)))
    public CompletionStage<Response> createTopic(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @Valid
            NewTopic.NewTopicDocument topic) {

        final UriBuilder location = uriInfo.getRequestUriBuilder();
        final boolean validateOnly = Boolean.TRUE.equals(topic.meta("validateOnly"));

        return topicService.createTopic(topic.getData().getAttributes(), validateOnly)
                .thenApply(NewTopic.NewTopicDocument::new)
                .thenApply(entity -> Response.status(validateOnly ? Status.OK : Status.CREATED)
                        .entity(entity)
                        .location(location.path(entity.getData().getId()).build()))
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{topicId}")
    @DELETE
    @APIResponseSchema(responseCode = "204", value = Void.class)
    public CompletionStage<Response> deleteTopic(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("topicId")
            @KafkaUuid(payload = ErrorCategory.ResourceNotFound.class, message = "No such topic")
            @Parameter(description = "Topic identifier")
            String topicId) {
        return topicService.deleteTopic(topicId)
                .thenApply(nothing -> Response.noContent())
                .thenApply(Response.ResponseBuilder::build);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(Topic.ListResponse.class)
    @APIResponse(responseCode = "500", ref = "ServerError")
    @APIResponse(responseCode = "504", ref = "ServerTimeout")
    public CompletionStage<Response> listTopics(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @QueryParam(FIELDS_PARAM)
            @DefaultValue(Topic.Fields.LIST_DEFAULT)
            @StringEnumeration(
                    source = FIELDS_PARAM,
                    allowedValues = {
                        Topic.Fields.NAME,
                        Topic.Fields.INTERNAL,
                        Topic.Fields.PARTITIONS,
                        Topic.Fields.AUTHORIZED_OPERATIONS,
                        Topic.Fields.CONFIGS,
                        Topic.Fields.RECORD_COUNT,
                        Topic.Fields.TOTAL_LEADER_LOG_BYTES,
                    },
                    payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    description = FieldFilter.FIELDS_DESCR,
                    explode = Explode.FALSE,
                    schema = @Schema(
                            type = SchemaType.ARRAY,
                            implementation = String.class,
                            enumeration = {
                                Topic.Fields.NAME,
                                Topic.Fields.INTERNAL,
                                Topic.Fields.PARTITIONS,
                                Topic.Fields.AUTHORIZED_OPERATIONS,
                                Topic.Fields.CONFIGS,
                                Topic.Fields.RECORD_COUNT,
                                Topic.Fields.TOTAL_LEADER_LOG_BYTES,
                            }))
            List<String> fields,

            @QueryParam("offsetSpec")
            @DefaultValue("latest")
            @KafkaOffsetSpec(payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    schema = @Schema(ref = "OffsetSpec"),
                    examples = {
                        @ExampleObject(ref = "EarliestOffset"),
                        @ExampleObject(ref = "LatestOffset"),
                        @ExampleObject(ref = "MaxTimestamp"),
                        @ExampleObject(ref = "LiteralTimestamp")
                    })
            String offsetSpec,

            @BeanParam
            @Valid
            ListFetchParams listParams) {

        requestedFields.accept(fields);
        ListRequestContext<Topic> listSupport = new ListRequestContext<>(Topic.Fields.COMPARATOR_BUILDER, uriInfo.getRequestUri(), listParams, Topic::fromCursor);

        return topicService.listTopics(fields, offsetSpec, listSupport)
                .thenApply(topics -> new Topic.ListResponse(topics, listSupport))
                .thenApply(Response::ok)
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{topicId}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(Topic.SingleResponse.class)
    @APIResponse(responseCode = "404", ref = "NotFound")
    @APIResponse(responseCode = "500", ref = "ServerError")
    @APIResponse(responseCode = "504", ref = "ServerTimeout")
    public CompletionStage<Response> describeTopic(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("topicId")
            @KafkaUuid(payload = ErrorCategory.ResourceNotFound.class, message = "No such topic")
            @Parameter(description = "Topic identifier")
            String topicId,

            @QueryParam(FIELDS_PARAM)
            @DefaultValue(Topic.Fields.DESCRIBE_DEFAULT)
            @StringEnumeration(
                    source = FIELDS_PARAM,
                    allowedValues = {
                        Topic.Fields.NAME,
                        Topic.Fields.INTERNAL,
                        Topic.Fields.PARTITIONS,
                        Topic.Fields.AUTHORIZED_OPERATIONS,
                        Topic.Fields.CONFIGS,
                        Topic.Fields.RECORD_COUNT,
                        Topic.Fields.TOTAL_LEADER_LOG_BYTES,
                    },
                    payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    description = FieldFilter.FIELDS_DESCR,
                    explode = Explode.FALSE,
                    schema = @Schema(
                            type = SchemaType.ARRAY,
                            implementation = String.class,
                            enumeration = {
                                Topic.Fields.NAME,
                                Topic.Fields.INTERNAL,
                                Topic.Fields.PARTITIONS,
                                Topic.Fields.AUTHORIZED_OPERATIONS,
                                Topic.Fields.CONFIGS,
                                Topic.Fields.RECORD_COUNT,
                                Topic.Fields.TOTAL_LEADER_LOG_BYTES,
                            }))
            List<String> fields,

            @QueryParam("offsetSpec")
            @DefaultValue(KafkaOffsetSpec.LATEST)
            @KafkaOffsetSpec(payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    schema = @Schema(ref = "OffsetSpec"),
                    examples = {
                        @ExampleObject(ref = "EarliestOffset"),
                        @ExampleObject(ref = "LatestOffset"),
                        @ExampleObject(ref = "MaxTimestamp"),
                        @ExampleObject(ref = "LiteralTimestamp")
                    })
            String offsetSpec) {

        requestedFields.accept(fields);

        return topicService.describeTopic(topicId, fields, offsetSpec)
                .thenApply(Topic.SingleResponse::new)
                .thenApply(Response::ok)
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{topicId}")
    @PATCH
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(responseCode = "204", value = Void.class)
    public CompletionStage<Response> patchTopic(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("topicId")
            @KafkaUuid(payload = ErrorCategory.ResourceNotFound.class, message = "No such topic")
            @Parameter(description = "Topic identifier")
            String topicId,

            @Valid
            TopicPatch.TopicPatchDocument topic) {

        final boolean validateOnly = Boolean.TRUE.equals(topic.meta("validateOnly"));

        return topicService.patchTopic(topicId, topic.getData().getAttributes(), validateOnly)
                .thenApply(nothing -> Response.noContent())
                .thenApply(Response.ResponseBuilder::build);
    }

}
