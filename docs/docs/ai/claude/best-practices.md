---
sidebar_position: 5
---

# Claude Best Practices

This guide provides best practices for using Claude with Magic Button Cloud to generate high-quality code and maximize productivity.

## General Best Practices

### Be Specific and Detailed

- **Provide Context**: Include domain knowledge and background information
- **Define Requirements Clearly**: Explicitly state what you need Claude to do
- **Use Specific Examples**: Show Claude exactly what you're looking for
- **Explain Purpose**: Describe why you need the code, not just what you need

### Iterative Development

- **Start Simple**: Begin with basic requirements and build up
- **Review Frequently**: Validate generated code before expanding
- **Use Feedback Loops**: Iterate on Claude's responses for continuous improvement
- **Keep Context**: Reference previous work in follow-up prompts

### Code Review

- **Always Review Generated Code**: Never use generated code without review
- **Check for Edge Cases**: Verify that edge cases are handled properly
- **Test Thoroughly**: Write tests for all generated code
- **Validate Business Logic**: Ensure business rules are correctly implemented

## Contract Development

### Domain Modeling

When using Claude for domain modeling:

1. **Define Core Entities**: Clearly describe each entity and its attributes
2. **Specify Relationships**: Explain how entities relate to each other
3. **Detail Constraints**: Outline validation rules and business constraints
4. **Provide Examples**: Include sample data for key scenarios

### Schema Definition

For effective schema definition with Claude:

1. **Start with Types**: Begin by defining your core types
2. **Build Up Complexity**: Add validation rules incrementally
3. **Include Documentation**: Ensure schemas are well-documented
4. **Reference Standards**: Mention any standards or patterns to follow

### Error Handling

To generate robust error handling:

1. **Categorize Errors**: Group errors by type (e.g., validation, business logic, system)
2. **Define Error Codes**: Create unique codes for each error condition
3. **Include Recovery Strategies**: Specify how to handle each error
4. **Consider Retries**: Identify which operations should be retried

## Client and Server Implementation

### Transport Configuration

When generating transport code:

1. **Specify Protocol**: Clearly indicate which protocol to use (WebSocket, HTTP, etc.)
2. **Define Connection Parameters**: Include all connection parameters
3. **Consider Security**: Specify security requirements (TLS, encryption, etc.)
4. **Handle Reconnection**: Describe reconnection strategies

### Authentication and Authorization

For auth-related code:

1. **Specify Auth Method**: Indicate which authentication method to use
2. **Define Roles and Permissions**: Clearly outline your access control model
3. **Include Token Handling**: Describe how tokens should be managed
4. **Consider Session Management**: Specify session lifecycle requirements

### Middleware

When generating middleware:

1. **Define Purpose**: Clearly state what each middleware should do
2. **Specify Order**: Indicate the order of middleware execution
3. **Include Error Handling**: Describe how errors should be handled
4. **Consider Performance**: Mention any performance considerations

## Testing

### Test Coverage

To generate comprehensive tests:

1. **Cover All Paths**: Ensure tests for success and failure paths
2. **Include Edge Cases**: Specify important edge cases to test
3. **Mock Dependencies**: Describe how dependencies should be mocked
4. **Verify Results**: Include assertions for expected outcomes

### Test Organization

For well-structured tests:

1. **Group by Feature**: Organize tests by feature or component
2. **Use Descriptive Names**: Request clear, descriptive test names
3. **Follow Patterns**: Specify test patterns to follow (e.g., Arrange-Act-Assert)

## Prompt Engineering Tips

### Structure Your Prompts

- **Use Headers**: Organize your prompts with clear sections
- **Number Steps**: Use numbered lists for sequential instructions
- **Use Formatting**: Utilize formatting to highlight important points
- **Include Examples**: Always provide examples when possible

### Common Patterns

Effective prompt patterns include:

1. **Start with Context**: Begin with domain context and background
2. **Define Requirements**: Clearly state what you need
3. **Provide Examples**: Show examples of similar code
4. **Specify Format**: Indicate how the response should be structured
5. **Request Explanation**: Ask Claude to explain key decisions

### Troubleshooting

If Claude's responses aren't meeting your needs:

1. **Be More Specific**: Add more detail to your prompt
2. **Provide Examples**: Show exactly what you're looking for
3. **Ask for Reasoning**: Request explanations for decisions
4. **Break Down Complex Requests**: Split complex tasks into smaller ones

## Examples

### Good Prompt Example

```
I need to create a contract for a notification system using @magicbutton.cloud/messaging. 

Domain Context:
The system sends notifications to users via multiple channels (email, SMS, push). 
Notifications can be triggered by various events and can have different priorities.
Users can subscribe to notification types and set preferred channels.

Entities:
- Notification: Has content, type, priority, and status
- Subscription: Links users to notification types and channels
- Channel: Represents delivery methods (email, SMS, push)

Events needed:
- notificationCreated: When a new notification is generated
- notificationDelivered: When a notification is successfully sent
- notificationFailed: When delivery fails

Requests needed:
- createNotification: Create a new notification for delivery
- getNotificationStatus: Check status of a notification
- updateSubscription: Update a user's notification preferences

Error scenarios:
- INVALID_CHANNEL: When an unsupported channel is specified
- DELIVERY_FAILURE: When notification delivery fails
- USER_NOT_FOUND: When user doesn't exist

Please generate a complete Zod-based contract using createContract, createEventMap, and createRequestSchemaMap from @magicbutton.cloud/messaging.
```

### Bad Prompt Example

```
Create a messaging contract.
```

## Advanced Topics

### Versioned Contracts

For generating versioned contracts:

1. **Define Version Strategy**: Explain your versioning approach
2. **Specify Compatibility Requirements**: Indicate backward compatibility needs
3. **Include Migration Paths**: Describe how to migrate between versions

### Complex Validation

For complex validation rules:

1. **Break Down Rules**: Split complex rules into smaller, clearer ones
2. **Provide Examples**: Include examples of valid and invalid data
3. **Explain Business Logic**: Describe the reasoning behind rules

### Performance Considerations

When performance is critical:

1. **Identify Hot Paths**: Highlight performance-critical sections
2. **Specify Constraints**: Mention resource constraints
3. **Request Optimizations**: Ask for specific optimization techniques