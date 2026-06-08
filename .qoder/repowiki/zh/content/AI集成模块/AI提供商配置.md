# AI提供商配置

<cite>
**本文档引用的文件**
- [server/src/index.ts](file://server/src/index.ts)
- [server/src/app.ts](file://server/src/app.ts)
- [server/src/routes/chat.ts](file://server/src/routes/chat.ts)
- [server/src/ai/provider.ts](file://server/src/ai/provider.ts)
- [server/src/ai/config.ts](file://server/src/ai/config.ts)
- [server/src/ai/prompts/system.ts](file://server/src/ai/prompts/system.ts)
- [server/src/ai/tools.ts](file://server/src/ai/tools.ts)
- [server/src/ai/schemas.ts](file://server/src/ai/schemas.ts)
- [shared/types/chat.ts](file://shared/types/chat.ts)
- [client/src/lib/store/settings-store.ts](file://client/src/lib/store/settings-store.ts)
</cite>

## 更新摘要
**所做更改**
- 新增双模型架构支持，包含轻量模型和深度模型配置
- 更新模型命名从 'deepseek-chat' 到 'deepseek-v4-flash' 和 'deepseek-v4-pro'
- 增强API密钥安全管理，引入独立的深度模型密钥配置
- 新增多模型路由机制，支持根据任务类型选择不同模型
- 扩展环境变量配置，支持更精细的模型参数控制

## 目录
1. [简介](#简介)
2. [双模型架构概览](#双模型架构概览)
3. [项目结构](#项目结构)
4. [核心组件](#核心组件)
5. [架构总览](#架构总览)
6. [详细组件分析](#详细组件分析)
7. [依赖关系分析](#依赖关系分析)
8. [性能与成本考量](#性能与成本考量)
9. [故障排查指南](#故障排查指南)
10. [结论](#结论)
11. [附录](#附录)

## 简介
本文件系统性阐述本项目的AI提供商配置与集成方式，重点覆盖以下方面：
- **双模型架构**：支持轻量模型（日常对话）和深度模型（深度分析）的独立配置
- **OpenAI兼容的AI服务集成路径与配置项**（API密钥、基础URL、模型名）
- **provider.ts中的AI提供商初始化流程**（认证、模型绑定）
- **支持的AI模型与参数约束**（温度、最大令牌数等）
- **健康检查与运行时日志中的关键信息**
- **开发与生产环境的配置策略与最佳实践**
- **扩展支持其他AI提供商的接口适配与配置标准化方法**

## 双模型架构概览
项目现已实现双模型架构，通过任务类型路由机制实现轻量模型和深度模型的智能切换：

```mermaid
graph TB
subgraph "双模型配置"
Light["轻量模型配置<br/>AI_API_KEY<br/>AI_BASE_URL<br/>AI_MODEL<br/>AI_TEMPERATURE<br/>AI_MAX_TOKENS"]
Deep["深度模型配置<br/>AI_DEEP_API_KEY<br/>AI_DEEP_BASE_URL<br/>AI_DEEP_MODEL<br/>AI_DEEP_TEMPERATURE<br/>AI_DEEP_MAX_TOKENS"]
Fallback["回退机制<br/>未配置项自动使用轻量模型配置"]
end
subgraph "模型路由"
TaskType["任务类型判断"]
LightRoute["light<br/>deepseek-v4-flash"]
DeepRoute["deep<br/>deepseek-v4-pro"]
TaskType --> LightRoute
TaskType --> DeepRoute
LightRoute --> Fallback
DeepRoute --> Fallback
end
Light --> TaskType
Deep --> TaskType
```

**图表来源**
- [server/src/ai/config.ts:11-32](file://server/src/ai/config.ts#L11-L32)
- [server/src/routes/chat.ts:24-26](file://server/src/routes/chat.ts#L24-L26)

**章节来源**
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)
- [server/src/routes/chat.ts:8-26](file://server/src/routes/chat.ts#L8-L26)

## 项目结构
项目采用前后端分离的典型结构，AI相关逻辑集中在后端的AI子模块，并通过Express路由对外提供聊天能力；前端通过状态管理维护AI配置预设。

```mermaid
graph TB
subgraph "客户端"
FE_Settings["设置存储<br/>settings-store.ts"]
end
subgraph "服务端"
S_Index["入口 index.ts"]
S_App["应用 app.ts"]
S_Routes_Chat["聊天路由 chat.ts<br/>双模型路由"]
S_AI_Provider["AI提供者工厂 provider.ts"]
S_AI_Config["模型配置 config.ts<br/>双模型配置"]
S_AI_Prompts["系统提示 promts/system.ts"]
S_AI_Tools["工具 tools.ts<br/>深度模型专用"]
S_AI_Schemas["Schema 校验 schemas.ts"]
end
FE_Settings --> S_Routes_Chat
S_Index --> S_App
S_App --> S_Routes_Chat
S_Routes_Chat --> S_AI_Provider
S_Routes_Chat --> S_AI_Config
S_Routes_Chat --> S_AI_Prompts
S_Routes_Chat --> S_AI_Tools
S_AI_Provider --> S_AI_Schemas
```

**图表来源**
- [server/src/index.ts:1-11](file://server/src/index.ts#L1-L11)
- [server/src/app.ts:1-72](file://server/src/app.ts#L1-L72)
- [server/src/routes/chat.ts:1-81](file://server/src/routes/chat.ts#L1-L81)
- [server/src/ai/provider.ts:1-12](file://server/src/ai/provider.ts#L1-L12)
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)
- [server/src/ai/prompts/system.ts:1-101](file://server/src/ai/prompts/system.ts#L1-L101)
- [server/src/ai/tools.ts:1-111](file://server/src/ai/tools.ts#L1-L111)
- [server/src/ai/schemas.ts:1-68](file://server/src/ai/schemas.ts#L1-L68)
- [client/src/lib/store/settings-store.ts:1-48](file://client/src/lib/store/settings-store.ts#L1-L48)

**章节来源**
- [server/src/index.ts:1-11](file://server/src/index.ts#L1-L11)
- [server/src/app.ts:1-72](file://server/src/app.ts#L1-L72)
- [server/src/routes/chat.ts:1-81](file://server/src/routes/chat.ts#L1-L81)
- [server/src/ai/provider.ts:1-12](file://server/src/ai/provider.ts#L1-L12)
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)
- [server/src/ai/prompts/system.ts:1-101](file://server/src/ai/prompts/system.ts#L1-L101)
- [server/src/ai/tools.ts:1-111](file://server/src/ai/tools.ts#L1-L111)
- [server/src/ai/schemas.ts:1-68](file://server/src/ai/schemas.ts#L1-L68)
- [client/src/lib/store/settings-store.ts:1-48](file://client/src/lib/store/settings-store.ts#L1-L48)

## 核心组件
- **AI提供者工厂**：封装OpenAI兼容服务的初始化与模型绑定，统一认证与基础URL注入。
- **双模型配置管理**：提供轻量模型和深度模型的独立配置解析，支持回退机制。
- **聊天路由**：接收请求、校验输入、根据任务类型选择模型、调用AI提供者并以Server-Sent Events流式返回。
- **系统提示**：定义专业领域、原则、参数体系、常见问题诊断与交互规范。
- **工具集**：提供生成调校方案、保存方案、对比方案等工具声明与参数Schema。
- **Schema校验**：对调校参数与完整方案进行严格的数据结构与取值范围约束。
- **健康检查**：暴露AI模型、基础URL、是否配置API Key等运行态信息。

**章节来源**
- [server/src/ai/provider.ts:1-12](file://server/src/ai/provider.ts#L1-L12)
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)
- [server/src/routes/chat.ts:1-81](file://server/src/routes/chat.ts#L1-L81)
- [server/src/ai/prompts/system.ts:1-101](file://server/src/ai/prompts/system.ts#L1-L101)
- [server/src/ai/tools.ts:1-111](file://server/src/ai/tools.ts#L1-L111)
- [server/src/ai/schemas.ts:1-68](file://server/src/ai/schemas.ts#L1-L68)
- [server/src/app.ts:15-58](file://server/src/app.ts#L15-L58)

## 架构总览
后端通过Express提供REST接口，聊天请求进入路由后，使用AI提供者工厂创建OpenAI兼容模型实例，结合系统提示、工具与Schema进行推理与流式输出。健康检查接口用于快速验证运行态配置。

```mermaid
sequenceDiagram
participant C as "客户端"
participant R as "聊天路由 chat.ts"
participant CFG as "配置管理 config.ts"
participant P as "提供者工厂 provider.ts"
participant O as "OpenAI兼容模型"
participant S as "系统提示 system.ts"
participant T as "工具 tools.ts"
C->>R : POST /api/chat/ (taskType : light/deep)
R->>R : 校验请求体与必填字段
R->>CFG : 根据taskType获取配置
CFG-->>R : 返回对应模型配置
R->>R : 读取环境变量(支持回退机制)
R->>P : createProvider({baseURL, apiKey, model})
P->>O : 创建并绑定模型实例
R->>O : streamText({system, messages, tools, maxSteps})
O-->>R : 数据流
R-->>C : SSE流式响应
Note over R,S : 系统提示与工具在推理过程中生效
```

**图表来源**
- [server/src/routes/chat.ts:12-45](file://server/src/routes/chat.ts#L12-L45)
- [server/src/ai/config.ts:12-32](file://server/src/ai/config.ts#L12-L32)
- [server/src/ai/provider.ts:5-11](file://server/src/ai/provider.ts#L5-L11)
- [server/src/ai/prompts/system.ts:1-101](file://server/src/ai/prompts/system.ts#L1-L101)
- [server/src/ai/tools.ts:19-52](file://server/src/ai/tools.ts#L19-L52)

## 详细组件分析

### 双模型配置管理（config.ts）
- **职责**：提供轻量模型和深度模型的独立配置解析，支持回退机制。
- **轻量模型配置**：默认使用 'deepseek-v4-flash' 模型，适合日常对话和轻量任务。
- **深度模型配置**：默认使用 'deepseek-v4-pro' 模型，适合复杂分析和调校方案生成。
- **API密钥安全**：深度模型支持独立的API密钥（AI_DEEP_API_KEY），未配置时自动回退到轻量模型密钥。
- **参数优化**：深度模型默认更低的温度值（0.3）和更大的最大令牌数（8192），适合复杂推理任务。

```mermaid
flowchart TD
Start(["调用 getLightModelConfig/getDeepModelConfig"]) --> Parse["解析环境变量"]
Parse --> CheckKey{"AI_DEEP_API_KEY存在?"}
CheckKey --> |是| UseDeepKey["使用AI_DEEP_API_KEY"]
CheckKey --> |否| UseFallback["回退到AI_API_KEY"]
UseDeepKey --> SetBaseURL["设置AI_DEEP_BASE_URL或回退"]
SetBaseURL --> SetModel["设置AI_DEEP_MODEL或回退"]
UseFallback --> SetModel
SetModel --> SetTemp["设置温度参数"]
SetTemp --> SetMaxTokens["设置最大令牌数"]
SetMaxTokens --> Return(["返回配置对象"])
```

**图表来源**
- [server/src/ai/config.ts:12-32](file://server/src/ai/config.ts#L12-L32)

**章节来源**
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)

### AI提供者工厂（provider.ts）
- **职责**：基于传入的baseURL、apiKey与model，创建OpenAI兼容的模型实例。
- **认证机制**：通过apiKey注入到OpenAI兼容客户端，确保后续调用携带有效凭证。
- **连接池与重试**：当前实现未显式配置连接池或重试策略，具体行为取决于底层SDK默认设置。
- **扩展点**：可通过修改此处的创建逻辑以适配其他兼容OpenAI协议的提供商。

```mermaid
flowchart TD
Start(["调用 createProvider"]) --> Build["创建 OpenAI 客户端实例<br/>注入 baseURL 与 apiKey"]
Build --> Bind["绑定指定模型 model"]
Bind --> Return(["返回模型实例"])
```

**图表来源**
- [server/src/ai/provider.ts:5-11](file://server/src/ai/provider.ts#L5-L11)

**章节来源**
- [server/src/ai/provider.ts:1-12](file://server/src/ai/provider.ts#L1-L12)

### 聊天路由（chat.ts）
- **输入校验**：要求messages为非空数组，否则返回400。
- **多模型路由**：根据taskType参数选择轻量模型或深度模型配置。
- **环境变量读取**：从进程环境读取AI_API_KEY、AI_BASE_URL、AI_MODEL等变量。
- **认证前置**：若未配置API Key，直接返回401。
- **流式输出**：使用SSE头与toDataStream将模型输出以流式方式返回。
- **错误处理**：在响应头未发送前返回JSON错误；若SSE已开始则发送error事件并结束连接。

```mermaid
flowchart TD
Req(["收到POST /api/chat/"]) --> Validate["校验 messages 参数"]
Validate --> |非法| Resp400["返回 400 错误"]
Validate --> |合法| CheckTask{"是否存在 taskType?"}
CheckTask --> |是| RouteTask["根据taskType路由"]
CheckTask --> |否| DefaultLight["默认使用轻量模型"]
RouteTask --> CheckDeep{"taskType === 'deep'?"}
CheckDeep --> |是| LoadDeep["加载深度模型配置"]
CheckDeep --> |否| LoadLight["加载轻量模型配置"]
LoadDeep --> CheckKey{"是否存在 API Key?"}
LoadLight --> CheckKey
CheckKey --> |否| Resp401["返回 401 错误"]
CheckKey --> |是| CreateProv["创建提供者实例"]
CreateProv --> Stream["streamText 推理"]
Stream --> Headers["设置SSE响应头"]
Headers --> Pipe["读取流并写入响应"]
Pipe --> Done(["完成/关闭连接"])
Resp400 --> End(["结束"])
Resp401 --> End
Done --> End
```

**图表来源**
- [server/src/routes/chat.ts:12-80](file://server/src/routes/chat.ts#L12-L80)

**章节来源**
- [server/src/routes/chat.ts:1-81](file://server/src/routes/chat.ts#L1-L81)

### 工具与Schema（tools.ts、schemas.ts）
- **工具集**：generateTune、saveTune、compareTunes，参数通过Zod Schema约束，确保调用时数据结构正确。
- **深度模型专用**：generateTune和compareTunes工具专门使用深度模型配置，提供更强的推理能力。
- **Schema校验**：对调校参数与完整方案进行严格的数值范围与字段约束，保障输出质量与一致性。

```mermaid
classDiagram
class Tools {
+generateTune(params)
+saveTune(params)
+compareTunes(params)
}
class DeepTools {
+generateTune(params) : 使用深度模型
+compareTunes(params) : 使用深度模型
}
class Schemas {
+tuningParametersSchema
+tuneSetupSchema
}
Tools --> Schemas : "参数与结果校验"
DeepTools --> Schemas : "参数与结果校验"
```

**图表来源**
- [server/src/ai/tools.ts:7-110](file://server/src/ai/tools.ts#L7-L110)
- [server/src/ai/schemas.ts:3-67](file://server/src/ai/schemas.ts#L3-L67)

**章节来源**
- [server/src/ai/tools.ts:1-111](file://server/src/ai/tools.ts#L1-L111)
- [server/src/ai/schemas.ts:1-68](file://server/src/ai/schemas.ts#L1-L68)

### 健康检查与运行时信息（app.ts、index.ts）
- **健康检查接口**：返回AI模型、基础URL、是否配置API Key等信息，便于运维监控。
- **模型可用性检查**：区分轻量模型和深度模型的可用状态。
- **启动日志**：打印当前使用的AI模型与端点，便于快速核对配置。

**章节来源**
- [server/src/app.ts:15-58](file://server/src/app.ts#L15-L58)
- [server/src/index.ts:6-10](file://server/src/index.ts#L6-L10)

### 前端配置预设（settings-store.ts）
- **提供者类型**：支持deepseek、openai、ollama、custom四种类型。
- **模型选择器**：显示轻量模型和深度模型的可用状态和描述。
- **预设基地址与模型**：针对不同提供商给出常用默认值，便于快速切换。
- **本地持久化**：使用zustand持久化存储，避免每次刷新丢失配置。

**章节来源**
- [client/src/lib/store/settings-store.ts:11-16](file://client/src/lib/store/settings-store.ts#L11-L16)
- [client/src/lib/store/settings-store.ts:18-48](file://client/src/lib/store/settings-store.ts#L18-L48)
- [shared/types/chat.ts:1-22](file://shared/types/chat.ts#L1-L22)

## 依赖关系分析
- **路由依赖提供者工厂**：聊天路由通过createProvider创建模型实例。
- **配置依赖环境变量**：双模型配置从process.env读取环境变量，支持回退机制。
- **工具依赖深度配置**：generateTune和compareTunes工具专门使用深度模型配置。
- **提供者工厂依赖OpenAI兼容SDK**：负责认证与模型绑定。
- **路由依赖系统提示与工具**：推理阶段使用系统提示与工具集合。
- **Schema依赖Zod**：保证参数与结果的结构与取值合规。
- **健康检查依赖环境变量**：用于展示当前运行态配置。

```mermaid
graph LR
Chat["chat.ts"] --> Provider["provider.ts"]
Chat --> Config["config.ts<br/>双模型配置"]
Chat --> Prompts["prompts/system.ts"]
Chat --> Tools["tools.ts"]
Tools --> DeepConfig["深度模型配置"]
Provider --> OpenAI["@ai-sdk/openai"]
Tools --> Zod["Zod Schema"]
App["app.ts"] --> Env["环境变量"]
Index["index.ts"] --> App
```

**图表来源**
- [server/src/routes/chat.ts:3-4](file://server/src/routes/chat.ts#L3-L4)
- [server/src/ai/provider.ts:1](file://server/src/ai/provider.ts#L1)
- [server/src/ai/config.ts:22-32](file://server/src/ai/config.ts#L22-L32)
- [server/src/ai/tools.ts:4](file://server/src/ai/tools.ts#L4)
- [server/src/app.ts:15-18](file://server/src/app.ts#L15-L18)
- [server/src/index.ts:1-2](file://server/src/index.ts#L1-L2)

**章节来源**
- [server/src/routes/chat.ts:1-81](file://server/src/routes/chat.ts#L1-L81)
- [server/src/ai/provider.ts:1-12](file://server/src/ai/provider.ts#L1-L12)
- [server/src/ai/config.ts:1-33](file://server/src/ai/config.ts#L1-L33)
- [server/src/ai/tools.ts:1-111](file://server/src/ai/tools.ts#L1-L111)
- [server/src/app.ts:15-58](file://server/src/app.ts#L15-L58)
- [server/src/index.ts:1-11](file://server/src/index.ts#L1-L11)

## 性能与成本考量
- **模型选择与成本**：不同提供商的单价与计费方式存在差异，建议在生产环境按需选择性价比更高的模型，并结合业务流量进行容量规划。
- **温度与最大令牌数**：轻量模型默认温度0.7，深度模型默认温度0.3；轻量模型最大令牌数4096，深度模型8192，需在体验与成本之间权衡。
- **流式传输**：SSE流式返回有助于降低首字节延迟，改善用户体验，但需注意网络中断与重连策略。
- **API密钥安全**：深度模型支持独立密钥配置，未配置时自动回退到轻量模型密钥，增强了API密钥安全管理。
- **运行时日志**：健康检查与启动日志可帮助快速定位配置问题，减少排障时间。

## 故障排查指南
- **400错误**：messages参数缺失或为空，检查前端请求体构造。
- **401错误**：未配置AI_API_KEY或AI_DEEP_API_KEY，检查环境变量与部署配置。
- **500错误**：AI调用失败，查看后端错误日志；若SSE已开始，将收到error事件。
- **模型不可用**：通过/api/health确认AI模型、基础URL与API Key状态。
- **任务类型错误**：确保taskType参数为'light'或'deep'，默认使用轻量模型。

**章节来源**
- [server/src/routes/chat.ts:19-31](file://server/src/routes/chat.ts#L19-L31)
- [server/src/routes/chat.ts:67-79](file://server/src/routes/chat.ts#L67-L79)
- [server/src/app.ts:15-29](file://server/src/app.ts#L15-L29)

## 结论
本项目通过统一的AI提供者工厂与OpenAI兼容SDK，实现了对多种提供商的标准化接入。新增的双模型架构通过任务类型路由机制，实现了轻量模型和深度模型的智能切换，增强了API密钥安全管理。配合系统提示、工具与Schema，能够稳定地输出高质量的结构化调校方案。建议在生产环境中完善重试与熔断策略，并结合实际业务对模型与参数进行精细化调优。

## 附录

### 环境变量与默认值
- **轻量模型**：
  - AI_API_KEY：必需，用于认证。
  - AI_BASE_URL：可选，默认指向DeepSeek端点。
  - AI_MODEL：可选，默认为deepseek-v4-flash。
  - AI_TEMPERATURE：可选，默认为0.7。
  - AI_MAX_TOKENS：可选，默认为4096。

- **深度模型**：
  - AI_DEEP_API_KEY：可选，深度模型独立API密钥，未配置时回退到AI_API_KEY。
  - AI_DEEP_BASE_URL：可选，默认回退到AI_BASE_URL。
  - AI_DEEP_MODEL：可选，默认为deepseek-v4-pro。
  - AI_DEEP_TEMPERATURE：可选，默认为0.3。
  - AI_DEEP_MAX_TOKENS：可选，默认为8192。

**章节来源**
- [server/src/ai/config.ts:12-32](file://server/src/ai/config.ts#L12-L32)

### 支持的AI提供商与默认配置
- **deepseek**：baseURL与model的默认值已在前端与后端分别设定。
- **openai**：提供者类型与默认模型可在前端预设中切换。
- **ollama**：本地推理默认端点与模型可在前端预设中选择。
- **custom**：允许自定义baseURL与model。

**章节来源**
- [client/src/lib/store/settings-store.ts:11-16](file://client/src/lib/store/settings-store.ts#L11-L16)
- [shared/types/chat.ts:15-22](file://shared/types/chat.ts#L15-L22)

### 模型命名变更历史
- **更新前**：使用 'deepseek-chat' 模型
- **更新后**：轻量模型使用 'deepseek-v4-flash'，深度模型使用 'deepseek-v4-pro'

**章节来源**
- [server/src/ai/config.ts:16](file://server/src/ai/config.ts#L16)
- [server/src/ai/config.ts:28](file://server/src/ai/config.ts#L28)

### 扩展其他AI提供商的步骤
- **接口适配**：在provider.ts中新增对应提供商的创建逻辑，保持与现有createProvider签名一致。
- **配置标准化**：在shared/types/chat.ts中扩展AIProviderType枚举与默认配置，前端settings-store.ts中补充预设。
- **参数Schema**：如新提供商有特殊参数，可在tools.ts与schemas.ts中扩展相应Schema。
- **健康检查**：在app.ts中更新健康检查返回的可用模型列表，便于运维监控。

**章节来源**
- [server/src/ai/provider.ts:5-11](file://server/src/ai/provider.ts#L5-L11)
- [shared/types/chat.ts:1-22](file://shared/types/chat.ts#L1-L22)
- [client/src/lib/store/settings-store.ts:11-16](file://client/src/lib/store/settings-store.ts#L11-L16)