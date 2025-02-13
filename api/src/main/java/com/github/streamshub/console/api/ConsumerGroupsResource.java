package com.github.streamshub.console.api;

import java.util.List;
import java.util.concurrent.CompletionStage;
import java.util.function.Consumer;

import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.validation.ConstraintTarget;
import jakarta.validation.Valid;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import org.eclipse.microprofile.openapi.annotations.enums.Explode;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.ExampleObject;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponseSchema;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.github.streamshub.console.api.model.ConsumerGroup;
import com.github.streamshub.console.api.model.ConsumerGroupFilterParams;
import com.github.streamshub.console.api.model.ListFetchParams;
import com.github.streamshub.console.api.security.Authorized;
import com.github.streamshub.console.api.security.ResourcePrivilege;
import com.github.streamshub.console.api.service.ConsumerGroupService;
import com.github.streamshub.console.api.support.ErrorCategory;
import com.github.streamshub.console.api.support.FieldFilter;
import com.github.streamshub.console.api.support.ListRequestContext;
import com.github.streamshub.console.api.support.StringEnumeration;
import com.github.streamshub.console.config.security.Privilege;

import io.xlate.validation.constraints.Expression;

@Path("/api/kafkas/{clusterId}/consumerGroups")
@Tag(name = "Kafka Cluster Resources")
public class ConsumerGroupsResource {

    @Inject
    UriInfo uriInfo;

    @Inject
    ConsumerGroupService consumerGroupService;

    /**
     * Allows the value of {@link FieldFilter#requestedFields} to be set for
     * the request.
     */
    @Inject
    @Named("requestedFields")
    Consumer<List<String>> requestedFields;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(ConsumerGroup.ListResponse.class)
    @APIResponse(responseCode = "500", ref = "ServerError")
    @APIResponse(responseCode = "504", ref = "ServerTimeout")
    @Authorized
    @ResourcePrivilege(Privilege.LIST)
    public CompletionStage<Response> listConsumerGroups(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @QueryParam(ConsumerGroup.FIELDS_PARAM)
            @DefaultValue(ConsumerGroup.Fields.LIST_DEFAULT)
            @StringEnumeration(
                    source = ConsumerGroup.FIELDS_PARAM,
                    allowedValues = {
                        ConsumerGroup.Fields.STATE,
                        ConsumerGroup.Fields.SIMPLE_CONSUMER_GROUP,
                        ConsumerGroup.Fields.MEMBERS,
                        ConsumerGroup.Fields.OFFSETS,
                        ConsumerGroup.Fields.AUTHORIZED_OPERATIONS,
                        ConsumerGroup.Fields.COORDINATOR,
                        ConsumerGroup.Fields.PARTITION_ASSIGNOR
                    },
                    payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    description = FieldFilter.FIELDS_DESCR,
                    explode = Explode.FALSE,
                    schema = @Schema(
                            type = SchemaType.ARRAY,
                            implementation = String.class,
                            enumeration = {
                                ConsumerGroup.Fields.STATE,
                                ConsumerGroup.Fields.SIMPLE_CONSUMER_GROUP,
                                ConsumerGroup.Fields.MEMBERS,
                                ConsumerGroup.Fields.OFFSETS,
                                ConsumerGroup.Fields.AUTHORIZED_OPERATIONS,
                                ConsumerGroup.Fields.COORDINATOR,
                                ConsumerGroup.Fields.PARTITION_ASSIGNOR
                            }))
            List<String> fields,

            @BeanParam
            @Valid
            ListFetchParams listParams,

            @BeanParam
            @Valid
            ConsumerGroupFilterParams filters) {

        requestedFields.accept(fields);
        ListRequestContext<ConsumerGroup> listSupport = new ListRequestContext<>(
                filters.buildPredicates(),
                ConsumerGroup.Fields.COMPARATOR_BUILDER,
                uriInfo.getRequestUri(),
                listParams,
                ConsumerGroup::fromCursor);

        return consumerGroupService.listConsumerGroups(fields, listSupport)
                .thenApply(groups -> new ConsumerGroup.ListResponse(groups, listSupport))
                .thenApply(Response::ok)
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{groupId}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponseSchema(ConsumerGroup.ConsumerGroupDocument.class)
    @APIResponse(responseCode = "404", ref = "NotFound")
    @APIResponse(responseCode = "500", ref = "ServerError")
    @APIResponse(responseCode = "504", ref = "ServerTimeout")
    @Authorized
    @ResourcePrivilege(Privilege.GET)
    public CompletionStage<Response> describeConsumerGroup(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("groupId")
            @Parameter(description = "Consumer group identifier")
            String groupId,

            @QueryParam(ConsumerGroup.FIELDS_PARAM)
            @DefaultValue(ConsumerGroup.Fields.DESCRIBE_DEFAULT)
            @StringEnumeration(
                    source = ConsumerGroup.FIELDS_PARAM,
                    allowedValues = {
                        ConsumerGroup.Fields.STATE,
                        ConsumerGroup.Fields.SIMPLE_CONSUMER_GROUP,
                        ConsumerGroup.Fields.MEMBERS,
                        ConsumerGroup.Fields.OFFSETS,
                        ConsumerGroup.Fields.AUTHORIZED_OPERATIONS,
                        ConsumerGroup.Fields.COORDINATOR,
                        ConsumerGroup.Fields.PARTITION_ASSIGNOR
                    },
                    payload = ErrorCategory.InvalidQueryParameter.class)
            @Parameter(
                    description = FieldFilter.FIELDS_DESCR,
                    explode = Explode.FALSE,
                    schema = @Schema(
                            type = SchemaType.ARRAY,
                            implementation = String.class,
                            enumeration = {
                                ConsumerGroup.Fields.STATE,
                                ConsumerGroup.Fields.SIMPLE_CONSUMER_GROUP,
                                ConsumerGroup.Fields.MEMBERS,
                                ConsumerGroup.Fields.OFFSETS,
                                ConsumerGroup.Fields.AUTHORIZED_OPERATIONS,
                                ConsumerGroup.Fields.COORDINATOR,
                                ConsumerGroup.Fields.PARTITION_ASSIGNOR
                            }))
            List<String> fields) {

        requestedFields.accept(fields);

        return consumerGroupService.describeConsumerGroup(groupId, fields)
                .thenApply(ConsumerGroup.ConsumerGroupDocument::new)
                .thenApply(Response::ok)
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{groupId}")
    @PATCH
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponse(responseCode = "200",
        description = "Consumer group patch dry run successful, nothing was applied",
        content = @Content(schema = @Schema(implementation = ConsumerGroup.ConsumerGroupDocument.class)))
    @APIResponse(responseCode = "204",
        description = "Consumer group patch successful, changes applied")
    @Expression(
        targetName = "args",
        // Only check when the request body Id is present (separately checked for @NotNull)
        when = "args[2].data.id != null",
        // Verify the Id in the request body matches the Id in the URL
        value = "args[1].equals(args[2].data.id)",
        message = "resource ID conflicts with operation URL",
        node = { "data", "id" },
        payload = ErrorCategory.InvalidResource.class,
        validationAppliesTo = ConstraintTarget.PARAMETERS)
    @Authorized
    @ResourcePrivilege(Privilege.UPDATE)
    public CompletionStage<Response> patchConsumerGroup(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("groupId")
            @Parameter(description = "Consumer group identifier")
            String groupId,

            @Valid
            @RequestBody(content = @Content(
                    schema = @Schema(implementation = ConsumerGroup.ConsumerGroupDocument.class),
                    examples = {
                        @ExampleObject(
                            name = "patchConsumerGroup-allPartitions",
                            externalValue = "/openapi/examples/patchConsumerGroup-allPartitions.json"),
                        @ExampleObject(
                            name = "patchConsumerGroup-byPartition",
                            externalValue = "/openapi/examples/patchConsumerGroup-byPartition.json"),
                    })
            )
            ConsumerGroup.ConsumerGroupDocument patch) {

        final boolean dryRun = Boolean.TRUE.equals(patch.meta("dryRun"));

        if (dryRun) {
            requestedFields.accept(List.of(
                ConsumerGroup.Fields.STATE,
                ConsumerGroup.Fields.MEMBERS,
                ConsumerGroup.Fields.OFFSETS
            ));
        }

        return consumerGroupService.patchConsumerGroup(patch.getData().getAttributes(), dryRun)
                .thenApply(optionalGroup -> optionalGroup
                        .map(ConsumerGroup.ConsumerGroupDocument::new)
                        .map(Response::ok)
                        .orElseGet(Response::noContent))
                .thenApply(Response.ResponseBuilder::build);
    }

    @Path("{groupId}")
    @DELETE
    @APIResponseSchema(responseCode = "204", value = Void.class)
    @Authorized
    @ResourcePrivilege(Privilege.DELETE)
    public CompletionStage<Response> deleteConsumerGroup(
            @Parameter(description = "Cluster identifier")
            @PathParam("clusterId")
            String clusterId,

            @PathParam("groupId")
            @Parameter(description = "Consumer group identifier")
            String groupId) {
        return consumerGroupService.deleteConsumerGroup(groupId)
                .thenApply(nothing -> Response.noContent())
                .thenApply(Response.ResponseBuilder::build);
    }
}
