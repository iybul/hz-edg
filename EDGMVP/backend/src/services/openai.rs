use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestSystemMessageArgs,
        ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs,
    },
    Client,
};

use crate::{errors::AppError, models::GenerateDocumentRequest};

#[derive(Clone)]
pub struct OpenAiService {
    model: String,
    client: Client<async_openai::config::OpenAIConfig>,
}

impl OpenAiService {
    pub fn new(model: String) -> Self {
        Self {
            model,
            client: Client::new(),
        }
    }

    pub async fn generate_sqf_manual(
        &self,
        questionnaire: &GenerateDocumentRequest,
    ) -> Result<String, AppError> {
        let payload = serde_json::to_string_pretty(questionnaire)
            .map_err(|error| AppError::BadRequest(error.to_string()))?;

        let request = CreateChatCompletionRequestArgs::default()
            .model(&self.model)
            .messages([
                ChatCompletionRequestMessage::System(
                    ChatCompletionRequestSystemMessageArgs::default()
                        .content(system_prompt())
                        .build()
                        .map_err(|error| AppError::OpenAi(error.to_string()))?,
                ),
                ChatCompletionRequestMessage::User(
                    ChatCompletionRequestUserMessageArgs::default()
                        .content(format!("Questionnaire JSON:\n{payload}"))
                        .build()
                        .map_err(|error| AppError::OpenAi(error.to_string()))?,
                ),
            ])
            .build()
            .map_err(|error| AppError::OpenAi(error.to_string()))?;

        let response = self
            .client
            .chat()
            .create(request)
            .await
            .map_err(|error| AppError::OpenAi(error.to_string()))?;

        response
            .choices
            .first()
            .and_then(|choice| choice.message.content.clone())
            .ok_or_else(|| AppError::OpenAi("model returned no document content".into()))
    }
}

fn system_prompt() -> &'static str {
    "You are an SQF Edition 10 food safety documentation specialist. \
Return structured Markdown only. Generate a practical food safety manual with \
clear headings for applicable SQF modules, including scope, responsibilities, \
procedures, monitoring records, verification activities, corrective actions, \
and document control notes. Do not include legal disclaimers or unsupported claims."
}
