# GEMINI_THINKING.md

## GEMINI 3 FLASH

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const tools = [
    {
      googleSearch: {
      }
    },
  ];
  const config = {
    thinkingConfig: {
      thinkingLevel: 'MINIMAL',
    },
    tools,
  };
  const model = 'gemini-3-flash-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();

## GEMINI 3 FLASH THINKING

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const tools = [
    {
      googleSearch: {
      }
    },
  ];
  const config = {
    thinkingConfig: {
      thinkingLevel: 'HIGH',
    },
    tools,
  };
  const model = 'gemini-3-flash-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();

## GEMINI EMMBEDING

<br />

<br />

| We have updated our[Terms of Service](https://ai.google.dev/gemini-api/terms).

The Gemini API offers text embedding models to generate embeddings for words, phrases, sentences, and code. These foundational embeddings power advanced NLP tasks such as semantic search, classification, and clustering, providing more accurate, context-aware results than keyword-based approaches.

Building Retrieval Augmented Generation (RAG) systems is a common use case for embeddings. Embeddings play a key role in significantly enhancing model outputs with improved factual accuracy, coherence, and contextual richness. They efficiently retrieve relevant information from knowledge bases, represented by embeddings, which are then passed as additional context in the input prompt to language models, guiding it to generate more informed and accurate responses.

To learn more about the available embedding model variants, see the[Model versions](https://ai.google.dev/gemini-api/docs/embeddings#model-versions)section. For higher throughput serving at half the price, try[Batch API Embedding](https://ai.google.dev/gemini-api/docs/embeddings#batch-embedding).

## Generating embeddings

Use the`embedContent`method to generate text embeddings:  

### Python

    from google import genai

    client = genai.Client()

    result = client.models.embed_content(
            model="gemini-embedding-001",
            contents="What is the meaning of life?")

    print(result.embeddings)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    async function main() {

        const ai = new GoogleGenAI({});

        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: 'What is the meaning of life?',
        });

        console.log(response.embeddings);
    }

    main();

### Go

    package main

    import (
        "context"
        "encoding/json"
        "fmt"
        "log"

        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }

        contents := []*genai.Content{
            genai.NewContentFromText("What is the meaning of life?", genai.RoleUser),
        }
        result, err := client.Models.EmbedContent(ctx,
            "gemini-embedding-001",
            contents,
            nil,
        )
        if err != nil {
            log.Fatal(err)
        }

        embeddings, err := json.MarshalIndent(result.Embeddings, "", "  ")
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println(string(embeddings))
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"model": "models/gemini-embedding-001",
         "content": {"parts":[{"text": "What is the meaning of life?"}]}
        }'

You can also generate embeddings for multiple chunks at once by passing them in as a list of strings.  

### Python

    from google import genai

    client = genai.Client()

    result = client.models.embed_content(
            model="gemini-embedding-001",
            contents= [
                "What is the meaning of life?",
                "What is the purpose of existence?",
                "How do I bake a cake?"
            ])

    for embedding in result.embeddings:
        print(embedding)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    async function main() {

        const ai = new GoogleGenAI({});

        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: [
                'What is the meaning of life?',
                'What is the purpose of existence?',
                'How do I bake a cake?'
            ],
        });

        console.log(response.embeddings);
    }

    main();

### Go

    package main

    import (
        "context"
        "encoding/json"
        "fmt"
        "log"

        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }

        contents := []*genai.Content{
            genai.NewContentFromText("What is the meaning of life?"),
            genai.NewContentFromText("How does photosynthesis work?"),
            genai.NewContentFromText("Tell me about the history of the internet."),
        }
        result, err := client.Models.EmbedContent(ctx,
            "gemini-embedding-001",
            contents,
            nil,
        )
        if err != nil {
            log.Fatal(err)
        }

        embeddings, err := json.MarshalIndent(result.Embeddings, "", "  ")
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println(string(embeddings))
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"requests": [{
        "model": "models/gemini-embedding-001",
        "content": {
        "parts":[{
            "text": "What is the meaning of life?"}]}, },
        {
        "model": "models/gemini-embedding-001",
        "content": {
        "parts":[{
            "text": "How much wood would a woodchuck chuck?"}]}, },
        {
        "model": "models/gemini-embedding-001",
        "content": {
        "parts":[{
            "text": "How does the brain work?"}]}, }, ]}' 2> /dev/null | grep -C 5 values
        ```

## Specify task type to improve performance

You can use embeddings for a wide range of tasks from classification to document search. Specifying the right task type helps optimize the embeddings for the intended relationships, maximizing accuracy and efficiency. For a complete list of supported task types, see the[Supported task types](https://ai.google.dev/gemini-api/docs/embeddings#supported-task-types)table.

The following example shows how you can use`SEMANTIC_SIMILARITY`to check how similar in meaning strings of texts are.
**Note:** Cosine similarity is a good distance metric because it focuses on direction rather than magnitude, which more accurately reflects conceptual closeness. Values range from -1 (opposite) to 1 (greatest similarity).  

### Python

    from google import genai
    from google.genai import types
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity

    client = genai.Client()

    texts = [
        "What is the meaning of life?",
        "What is the purpose of existence?",
        "How do I bake a cake?"]

    result = [
        np.array(e.values) for e in client.models.embed_content(
            model="gemini-embedding-001",
            contents=texts,
            config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")).embeddings
    ]

    # Calculate cosine similarity. Higher scores = greater semantic similarity.

    embeddings_matrix = np.array(result)
    similarity_matrix = cosine_similarity(embeddings_matrix)

    for i, text1 in enumerate(texts):
        for j in range(i + 1, len(texts)):
            text2 = texts[j]
            similarity = similarity_matrix[i, j]
            print(f"Similarity between '{text1}' and '{text2}': {similarity:.4f}")

### JavaScript

    import { GoogleGenAI } from "@google/genai";
    import * as cosineSimilarity from "compute-cosine-similarity";

    async function main() {
        const ai = new GoogleGenAI({});

        const texts = [
            "What is the meaning of life?",
            "What is the purpose of existence?",
            "How do I bake a cake?",
        ];

        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: texts,
            taskType: 'SEMANTIC_SIMILARITY'
        });

        const embeddings = response.embeddings.map(e => e.values);

        for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
                const text1 = texts[i];
                const text2 = texts[j];
                const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
                console.log(`Similarity between '${text1}' and '${text2}': ${similarity.toFixed(4)}`);
            }
        }
    }

    main();

### Go

    package main

    import (
        "context"
        "fmt"
        "log"
        "math"

        "google.golang.org/genai"
    )

    // cosineSimilarity calculates the similarity between two vectors.
    func cosineSimilarity(a, b []float32) (float64, error) {
        if len(a) != len(b) {
            return 0, fmt.Errorf("vectors must have the same length")
        }

        var dotProduct, aMagnitude, bMagnitude float64
        for i := 0; i < len(a); i++ {
            dotProduct += float64(a[i] * b[i])
            aMagnitude += float64(a[i] * a[i])
            bMagnitude += float64(b[i] * b[i])
        }

        if aMagnitude == 0 || bMagnitude == 0 {
            return 0, nil
        }

        return dotProduct / (math.Sqrt(aMagnitude) * math.Sqrt(bMagnitude)), nil
    }

    func main() {
        ctx := context.Background()
        client, _ := genai.NewClient(ctx, nil)
        defer client.Close()

        texts := []string{
            "What is the meaning of life?",
            "What is the purpose of existence?",
            "How do I bake a cake?",
        }

        var contents []*genai.Content
        for _, text := range texts {
            contents = append(contents, genai.NewContentFromText(text, genai.RoleUser))
        }

        result, _ := client.Models.EmbedContent(ctx,
            "gemini-embedding-001",
            contents,
            &genai.EmbedContentRequest{TaskType: genai.TaskTypeSemanticSimilarity},
        )

        embeddings := result.Embeddings

        for i := 0; i < len(texts); i++ {
            for j := i + 1; j < len(texts); j++ {
                similarity, _ := cosineSimilarity(embeddings[i].Values, embeddings[j].Values)
                fmt.Printf("Similarity between '%s' and '%s': %.4f\n", texts[i], texts[j], similarity)
            }
        }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"task_type": "SEMANTIC_SIMILARITY",
        "content": {
        "parts":[{
        "text": "What is the meaning of life?"}, {"text": "How much wood would a woodchuck chuck?"}, {"text": "How does the brain work?"}]}
        }'

The following shows an example output from this code snippet:  

    Similarity between 'What is the meaning of life?' and 'What is the purpose of existence?': 0.9481

    Similarity between 'What is the meaning of life?' and 'How do I bake a cake?': 0.7471

    Similarity between 'What is the purpose of existence?' and 'How do I bake a cake?': 0.7371

### Supported task types

|        Task type         |                                                                                                                  Description                                                                                                                   |                         Examples                          |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| **SEMANTIC_SIMILARITY**  | Embeddings optimized to assess text similarity.                                                                                                                                                                                                | Recommendation systems, duplicate detection               |
| **CLASSIFICATION**       | Embeddings optimized to classify texts according to preset labels.                                                                                                                                                                             | Sentiment analysis, spam detection                        |
| **CLUSTERING**           | Embeddings optimized to cluster texts based on their similarities.                                                                                                                                                                             | Document organization, market research, anomaly detection |
| **RETRIEVAL_DOCUMENT**   | Embeddings optimized for document search.                                                                                                                                                                                                      | Indexing articles, books, or web pages for search.        |
| **RETRIEVAL_QUERY**      | Embeddings optimized for general search queries. Use`RETRIEVAL_QUERY`for queries;`RETRIEVAL_DOCUMENT`for documents to be retrieved.                                                                                                            | Custom search                                             |
| **CODE_RETRIEVAL_QUERY** | Embeddings optimized for retrieval of code blocks based on natural language queries. Use`CODE_RETRIEVAL_QUERY`for queries;`RETRIEVAL_DOCUMENT`for code blocks to be retrieved.                                                                 | Code suggestions and search                               |
| **QUESTION_ANSWERING**   | Embeddings for questions in a question-answering system, optimized for finding documents that answer the question. Use`QUESTION_ANSWERING`for questions;`RETRIEVAL_DOCUMENT`for documents to be retrieved.                                     | Chatbox                                                   |
| **FACT_VERIFICATION**    | Embeddings for statements that need to be verified, optimized for retrieving documents that contain evidence supporting or refuting the statement. Use`FACT_VERIFICATION`for the target text;`RETRIEVAL_DOCUMENT`for documents to be retrieved | Automated fact-checking systems                           |

## Controlling embedding size

The Gemini embedding model,`gemini-embedding-001`, is trained using the Matryoshka Representation Learning (MRL) technique which teaches a model to learn high-dimensional embeddings that have initial segments (or prefixes) which are also useful, simpler versions of the same data.

Use the`output_dimensionality`parameter to control the size of the output embedding vector. Selecting a smaller output dimensionality can save storage space and increase computational efficiency for downstream applications, while sacrificing little in terms of quality. By default, it outputs a 3072-dimensional embedding, but you can truncate it to a smaller size without losing quality to save storage space. We recommend using 768, 1536, or 3072 output dimensions.  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents="What is the meaning of life?",
        config=types.EmbedContentConfig(output_dimensionality=768)
    )

    [embedding_obj] = result.embeddings
    embedding_length = len(embedding_obj.values)

    print(f"Length of embedding: {embedding_length}")

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    async function main() {
        const ai = new GoogleGenAI({});

        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            content: 'What is the meaning of life?',
            outputDimensionality: 768,
        });

        const embeddingLength = response.embedding.values.length;
        console.log(`Length of embedding: ${embeddingLength}`);
    }

    main();

### Go

    package main

    import (
        "context"
        "fmt"
        "log"

        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        // The client uses Application Default Credentials.
        // Authenticate with 'gcloud auth application-default login'.
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }
        defer client.Close()

        contents := []*genai.Content{
            genai.NewContentFromText("What is the meaning of life?", genai.RoleUser),
        }

        result, err := client.Models.EmbedContent(ctx,
            "gemini-embedding-001",
            contents,
            &genai.EmbedContentRequest{OutputDimensionality: 768},
        )
        if err != nil {
            log.Fatal(err)
        }

        embedding := result.Embeddings[0]
        embeddingLength := len(embedding.Values)
        fmt.Printf("Length of embedding: %d\n", embeddingLength)
    }

### REST

    curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent" \
        -H "x-goog-api-key: $GEMINI_API_KEY" \
        -H 'Content-Type: application/json' \
        -d '{
            "content": {"parts":[{ "text": "What is the meaning of life?"}]},
            "output_dimensionality": 768
        }'

Example output from the code snippet:  

    Length of embedding: 768

## Ensuring quality for smaller dimensions

The 3072 dimension embedding is normalized. Normalized embeddings produce more accurate semantic similarity by comparing vector direction, not magnitude. For other dimensions, including 768 and 1536, you need to normalize the embeddings as follows:  

### Python

    import numpy as np
    from numpy.linalg import norm

    embedding_values_np = np.array(embedding_obj.values)
    normed_embedding = embedding_values_np / np.linalg.norm(embedding_values_np)

    print(f"Normed embedding length: {len(normed_embedding)}")
    print(f"Norm of normed embedding: {np.linalg.norm(normed_embedding):.6f}") # Should be very close to 1

Example output from this code snippet:  

    Normed embedding length: 768
    Norm of normed embedding: 1.000000

The following table shows the MTEB scores, a commonly used benchmark for embeddings, for different dimensions. Notably, the result shows that performance is not strictly tied to the size of the embedding dimension, with lower dimensions achieving scores comparable to their higher dimension counterparts.

| MRL Dimension | MTEB Score |
|---------------|------------|
| 2048          | 68.16      |
| 1536          | 68.17      |
| 768           | 67.99      |
| 512           | 67.55      |
| 256           | 66.19      |
| 128           | 63.31      |

## Use cases

Text embeddings are crucial for a variety of common AI use cases, such as:

- **Retrieval-Augmented Generation (RAG):**Embeddings enhance the quality of generated text by retrieving and incorporating relevant information into the context of a model.
- **Information retrieval:**Search for the most semantically similar text or documents given a piece of input text.

  [Document search tutorialtask](https://github.com/google-gemini/cookbook/blob/main/examples/Talk_to_documents_with_embeddings.ipynb)
- **Search reranking**: Prioritize the most relevant items by semantically scoring initial results against the query.

  [Search reranking tutorialtask](https://github.com/google-gemini/cookbook/blob/main/examples/Search_reranking_using_embeddings.ipynb)
- **Anomaly detection:**Comparing groups of embeddings can help identify hidden trends or outliers.

  [Anomaly detection tutorialbubble_chart](https://github.com/google-gemini/cookbook/blob/main/examples/Anomaly_detection_with_embeddings.ipynb)
- **Classification:**Automatically categorize text based on its content, such as sentiment analysis or spam detection

  [Classification tutorialtoken](https://github.com/google-gemini/cookbook/blob/main/examples/Classify_text_with_embeddings.ipynb)
- **Clustering:**Effectively grasp complex relationships by creating clusters and visualizations of your embeddings.

  [Clustering visualization tutorialbubble_chart](https://github.com/google-gemini/cookbook/blob/main/examples/clustering_with_embeddings.ipynb)

## Storing embeddings

As you take embeddings to production, it is common to use**vector databases** to efficiently store, index, and retrieve high-dimensional embeddings. Google Cloud offers managed data services that can be used for this purpose including[BigQuery](https://cloud.google.com/bigquery/docs/introduction),[AlloyDB](https://cloud.google.com/alloydb/docs/overview), and[Cloud SQL](https://cloud.google.com/sql/docs/postgres/introduction).

The following tutorials show how to use other third party vector databases with Gemini Embedding.

- [ChromaDB tutorialsbolt](https://github.com/google-gemini/cookbook/tree/main/examples/chromadb)
- [QDrant tutorialsbolt](https://github.com/google-gemini/cookbook/tree/main/examples/qdrant)
- [Weaviate tutorialsbolt](https://github.com/google-gemini/cookbook/tree/main/examples/weaviate)
- [Pinecone tutorialsbolt](https://github.com/google-gemini/cookbook/blob/main/examples/langchain/Gemini_LangChain_QA_Pinecone_WebLoad.ipynb)

## Model versions

|                                    Property                                    |                                                                                                          Description                                                                                                          |
|--------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id_cardModel code                                                              | **Gemini API** `gemini-embedding-001`                                                                                                                                                                                         |
| saveSupported data types                                                       | **Input** Text **Output** Text embeddings                                                                                                                                                                                     |
| token_autoToken limits^[\[\*\]](https://ai.google.dev/gemini-api/docs/tokens)^ | **Input token limit** 2,048 **Output dimension size** Flexible, supports: 128 - 3072, Recommended: 768, 1536, 3072                                                                                                            |
| 123Versions                                                                    | Read the[model version patterns](https://ai.google.dev/gemini-api/docs/models/gemini#model-versions)for more details. - Stable:`gemini-embedding-001` - Experimental:`gemini-embedding-exp-03-07`(deprecating in Oct of 2025) |
| calendar_monthLatest update                                                    | June 2025                                                                                                                                                                                                                     |

## Batch embeddings

If latency is not a concern, try using the Gemini Embeddings model with[Batch API](https://ai.google.dev/gemini-api/docs/batch-api#batch-embedding). This allows for much higher throughput at 50% of interactive Embedding pricing. Find examples on how to get started in the[Batch API cookbook](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Batch_mode.ipynb).

## Responsible use notice

Unlike generative AI models that create new content, the Gemini Embedding model is only intended to transform the format of your input data into a numerical representation. While Google is responsible for providing an embedding model that transforms the format of your input data to the numerical-format requested, users retain full responsibility for the data they input and the resulting embeddings. By using the Gemini Embedding model you confirm that you have the necessary rights to any content that you upload. Do not generate content that infringes on others' intellectual property or privacy rights. Your use of this service is subject to our[Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)and[Google's Terms of Service](https://ai.google.dev/gemini-api/terms).

## Start building with embeddings

Check out the[embeddings quickstart notebook](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Embeddings.ipynb)to explore the model capabilities and learn how to customize and visualize your embeddings.

## Deprecation notice for legacy models

The following models will be deprecated in October, 2025: -`embedding-001`-`embedding-gecko-001`-`gemini-embedding-exp-03-07`(`gemini-embedding-exp`)

## GEMINI THINKING

<br />

<br />

The[Gemini 3 and 2.5 series models](https://ai.google.dev/gemini-api/docs/models)use an internal "thinking process" that significantly improves their reasoning and multi-step planning abilities, making them highly effective for complex tasks such as coding, advanced mathematics, and data analysis.

This guide shows you how to work with Gemini's thinking capabilities using the Gemini API.

## Generating content with thinking

Initiating a request with a thinking model is similar to any other content generation request. The key difference lies in specifying one of the[models with thinking support](https://ai.google.dev/gemini-api/docs/thinking#supported-models)in the`model`field, as demonstrated in the following[text generation](https://ai.google.dev/gemini-api/docs/text-generation#text-input)example:  

### Python

    from google import genai

    client = genai.Client()
    prompt = "Explain the concept of Occam's Razor and provide a simple, everyday example."
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const prompt = "Explain the concept of Occam's Razor and provide a simple, everyday example.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
      });

      console.log(response.text);
    }

    main();

### Go

    package main

    import (
      "context"
      "fmt"
      "log"
      "os"
      "google.golang.org/genai"
    )

    func main() {
      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      prompt := "Explain the concept of Occam's Razor and provide a simple, everyday example."
      model := "gemini-2.5-pro"

      resp, _ := client.Models.GenerateContent(ctx, model, genai.Text(prompt), nil)

      fmt.Println(resp.Text())
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent" \
     -H "x-goog-api-key: $GEMINI_API_KEY" \
     -H 'Content-Type: application/json' \
     -X POST \
     -d '{
       "contents": [
         {
           "parts": [
             {
               "text": "Explain the concept of Occam\'s Razor and provide a simple, everyday example."
             }
           ]
         }
       ]
     }'
     ```

## Thought summaries

Thought summaries are synthesized versions of the model's raw thoughts and offer insights into the model's internal reasoning process. Note that thinking levels and budgets apply to the model's raw thoughts and not to thought summaries.

You can enable thought summaries by setting`includeThoughts`to`true`in your request configuration. You can then access the summary by iterating through the`response`parameter's`parts`, and checking the`thought`boolean.

Here's an example demonstrating how to enable and retrieve thought summaries without streaming, which returns a single, final thought summary with the response:  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()
    prompt = "What is the sum of the first 50 prime numbers?"
    response = client.models.generate_content(
      model="gemini-2.5-pro",
      contents=prompt,
      config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
          include_thoughts=True
        )
      )
    )

    for part in response.candidates[0].content.parts:
      if not part.text:
        continue
      if part.thought:
        print("Thought summary:")
        print(part.text)
        print()
      else:
        print("Answer:")
        print(part.text)
        print()

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: "What is the sum of the first 50 prime numbers?",
        config: {
          thinkingConfig: {
            includeThoughts: true,
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (!part.text) {
          continue;
        }
        else if (part.thought) {
          console.log("Thoughts summary:");
          console.log(part.text);
        }
        else {
          console.log("Answer:");
          console.log(part.text);
        }
      }
    }

    main();

### Go

    package main

    import (
      "context"
      "fmt"
      "google.golang.org/genai"
      "os"
    )

    func main() {
      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      contents := genai.Text("What is the sum of the first 50 prime numbers?")
      model := "gemini-2.5-pro"
      resp, _ := client.Models.GenerateContent(ctx, model, contents, &genai.GenerateContentConfig{
        ThinkingConfig: &genai.ThinkingConfig{
          IncludeThoughts: true,
        },
      })

      for _, part := range resp.Candidates[0].Content.Parts {
        if part.Text != "" {
          if part.Thought {
            fmt.Println("Thoughts Summary:")
            fmt.Println(part.Text)
          } else {
            fmt.Println("Answer:")
            fmt.Println(part.Text)
          }
        }
      }
    }

And here is an example using thinking with streaming, which returns rolling, incremental summaries during generation:  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    prompt = """
    Alice, Bob, and Carol each live in a different house on the same street: red, green, and blue.
    The person who lives in the red house owns a cat.
    Bob does not live in the green house.
    Carol owns a dog.
    The green house is to the left of the red house.
    Alice does not own a cat.
    Who lives in each house, and what pet do they own?
    """

    thoughts = ""
    answer = ""

    for chunk in client.models.generate_content_stream(
        model="gemini-2.5-pro",
        contents=prompt,
        config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(
            include_thoughts=True
          )
        )
    ):
      for part in chunk.candidates[0].content.parts:
        if not part.text:
          continue
        elif part.thought:
          if not thoughts:
            print("Thoughts summary:")
          print(part.text)
          thoughts += part.text
        else:
          if not answer:
            print("Answer:")
          print(part.text)
          answer += part.text

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    const prompt = `Alice, Bob, and Carol each live in a different house on the same
    street: red, green, and blue. The person who lives in the red house owns a cat.
    Bob does not live in the green house. Carol owns a dog. The green house is to
    the left of the red house. Alice does not own a cat. Who lives in each house,
    and what pet do they own?`;

    let thoughts = "";
    let answer = "";

    async function main() {
      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          thinkingConfig: {
            includeThoughts: true,
          },
        },
      });

      for await (const chunk of response) {
        for (const part of chunk.candidates[0].content.parts) {
          if (!part.text) {
            continue;
          } else if (part.thought) {
            if (!thoughts) {
              console.log("Thoughts summary:");
            }
            console.log(part.text);
            thoughts = thoughts + part.text;
          } else {
            if (!answer) {
              console.log("Answer:");
            }
            console.log(part.text);
            answer = answer + part.text;
          }
        }
      }
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "log"
      "os"
      "google.golang.org/genai"
    )

    const prompt = `
    Alice, Bob, and Carol each live in a different house on the same street: red, green, and blue.
    The person who lives in the red house owns a cat.
    Bob does not live in the green house.
    Carol owns a dog.
    The green house is to the left of the red house.
    Alice does not own a cat.
    Who lives in each house, and what pet do they own?
    `

    func main() {
      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      contents := genai.Text(prompt)
      model := "gemini-2.5-pro"

      resp := client.Models.GenerateContentStream(ctx, model, contents, &genai.GenerateContentConfig{
        ThinkingConfig: &genai.ThinkingConfig{
          IncludeThoughts: true,
        },
      })

      for chunk := range resp {
        for _, part := range chunk.Candidates[0].Content.Parts {
          if len(part.Text) == 0 {
            continue
          }

          if part.Thought {
            fmt.Printf("Thought: %s\n", part.Text)
          } else {
            fmt.Printf("Answer: %s\n", part.Text)
          }
        }
      }
    }

## Controlling thinking

Gemini models engage in dynamic thinking by default, automatically adjusting the amount of reasoning effort based on the complexity of the user's request. However, if you have specific latency constraints or require the model to engage in deeper reasoning than usual, you can optionally use parameters to control thinking behavior.

### Thinking levels (Gemini 3)

The`thinkingLevel`parameter, recommended for Gemini 3 models and onwards, lets you control reasoning behavior. You can set thinking level to`"low"`or`"high"`for Gemini 3 Pro, and`"minimal"`,`"low"`,`"medium"`, and`"high"`for Gemini 3 Flash.

**Gemini 3 Pro and Flash thinking levels:**

- `low`: Minimizes latency and cost. Best for simple instruction following, chat, or high-throughput applications
- `high`(Default, dynamic): Maximizes reasoning depth. The model may take significantly longer to reach a first token, but the output will be more carefully reasoned.

**Gemini 3 Flash thinking levels**

In addition to the levels above, Gemini 3 Flash also supports the following thinking levels that are not currently supported by Gemini 3 Pro:

- `medium`: Balanced thinking for most tasks.
- `minimal`: Matches the "no thinking" setting for most queries. The model may think very minimally for complex coding tasks. Minimizes latency for chat or high throughput applications.

  | **Note:** `minimal`does not guarantee that thinking is off.

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Provide a list of 3 famous physicists and their key contributions",
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="low")
        ),
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI, ThinkingLevel } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Provide a list of 3 famous physicists and their key contributions",
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      console.log(response.text);
    }

    main();

### Go

    package main

    import (
      "context"
      "fmt"
      "google.golang.org/genai"
      "os"
    )

    func main() {
      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      thinkingLevelVal := "low"

      contents := genai.Text("Provide a list of 3 famous physicists and their key contributions")
      model := "gemini-3-flash-preview"
      resp, _ := client.Models.GenerateContent(ctx, model, contents, &genai.GenerateContentConfig{
        ThinkingConfig: &genai.ThinkingConfig{
          ThinkingLevel: &thinkingLevelVal,
        },
      })

    fmt.Println(resp.Text())
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [
        {
          "parts": [
            {
              "text": "Provide a list of 3 famous physicists and their key contributions"
            }
          ]
        }
      ],
      "generationConfig": {
        "thinkingConfig": {
              "thinkingLevel": "low"
        }
      }
    }'

You cannot disable thinking for Gemini 3 Pro. Gemini 3 Flash also does not support full thinking-off, but the`minimal`setting means the model likely will not think (though it still potentially can). If you don't specify a thinking level, Gemini will use the Gemini 3 models' default dynamic thinking level,`"high"`.

Gemini 2.5 series models don't support`thinkingLevel`; use`thinkingBudget`instead.

### Thinking budgets

The`thinkingBudget`parameter, introduced with the Gemini 2.5 series, guides the model on the specific number of thinking tokens to use for reasoning.
| **Note:** Use the`thinkingLevel`parameter with Gemini 3 models. While`thinkingBudget`is accepted for backwards compatibility, using it with Gemini 3 Pro may result in suboptimal performance.

The following are`thinkingBudget`configuration details for each model type. You can disable thinking by setting`thinkingBudget`to 0. Setting the`thinkingBudget`to -1 turns on**dynamic thinking**, meaning the model will adjust the budget based on the complexity of the request.

|                       Model                       |        Default setting (Thinking budget is not set)        |     Range      |       Disable thinking       | Turn on dynamic thinking |
|---------------------------------------------------|------------------------------------------------------------|----------------|------------------------------|--------------------------|
| **2.5 Pro**                                       | Dynamic thinking: Model decides when and how much to think | `128`to`32768` | N/A: Cannot disable thinking | `thinkingBudget = -1`    |
| **2.5 Flash**                                     | Dynamic thinking: Model decides when and how much to think | `0`to`24576`   | `thinkingBudget = 0`         | `thinkingBudget = -1`    |
| **2.5 Flash Preview**                             | Dynamic thinking: Model decides when and how much to think | `0`to`24576`   | `thinkingBudget = 0`         | `thinkingBudget = -1`    |
| **2.5 Flash Lite**                                | Model does not think                                       | `512`to`24576` | `thinkingBudget = 0`         | `thinkingBudget = -1`    |
| **2.5 Flash Lite Preview**                        | Model does not think                                       | `512`to`24576` | `thinkingBudget = 0`         | `thinkingBudget = -1`    |
| **Robotics-ER 1.5 Preview**                       | Dynamic thinking: Model decides when and how much to think | `0`to`24576`   | `thinkingBudget = 0`         | `thinkingBudget = -1`    |
| **2.5 Flash Live Native Audio Preview (09-2025)** | Dynamic thinking: Model decides when and how much to think | `0`to`24576`   | `thinkingBudget = 0`         | `thinkingBudget = -1`    |

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Provide a list of 3 famous physicists and their key contributions",
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=1024)
            # Turn off thinking:
            # thinking_config=types.ThinkingConfig(thinking_budget=0)
            # Turn on dynamic thinking:
            # thinking_config=types.ThinkingConfig(thinking_budget=-1)
        ),
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Provide a list of 3 famous physicists and their key contributions",
        config: {
          thinkingConfig: {
            thinkingBudget: 1024,
            // Turn off thinking:
            // thinkingBudget: 0
            // Turn on dynamic thinking:
            // thinkingBudget: -1
          },
        },
      });

      console.log(response.text);
    }

    main();

### Go

    package main

    import (
      "context"
      "fmt"
      "google.golang.org/genai"
      "os"
    )

    func main() {
      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      thinkingBudgetVal := int32(1024)

      contents := genai.Text("Provide a list of 3 famous physicists and their key contributions")
      model := "gemini-2.5-flash"
      resp, _ := client.Models.GenerateContent(ctx, model, contents, &genai.GenerateContentConfig{
        ThinkingConfig: &genai.ThinkingConfig{
          ThinkingBudget: &thinkingBudgetVal,
          // Turn off thinking:
          // ThinkingBudget: int32(0),
          // Turn on dynamic thinking:
          // ThinkingBudget: int32(-1),
        },
      })

    fmt.Println(resp.Text())
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [
        {
          "parts": [
            {
              "text": "Provide a list of 3 famous physicists and their key contributions"
            }
          ]
        }
      ],
      "generationConfig": {
        "thinkingConfig": {
              "thinkingBudget": 1024
        }
      }
    }'

Depending on the prompt, the model might overflow or underflow the token budget.

## Thought signatures

The Gemini API is stateless, so the model treats every API request independently and doesn't have access to thought context from previous turns in multi-turn interactions.

In order to enable maintaining thought context across multi-turn interactions, Gemini returns thought signatures, which are encrypted representations of the model's internal thought process.

- **Gemini 2.5 models** return thought signatures when thinking is enabled and the request includes[function calling](https://ai.google.dev/gemini-api/docs/function-calling#thinking), specifically[function declarations](https://ai.google.dev/gemini-api/docs/function-calling#step-2).
- **Gemini 3 models** may return thought signatures for all types of[parts](https://ai.google.dev/api/caching#Part). We recommend you always pass all signatures back as received, but it's*required* for function calling signatures. Read the[Thought Signatures](https://ai.google.dev/gemini-api/docs/thought-signatures)page to learn more.

  | **Note:** Circulation of thought signatures is required even when set to`minimal`for Gemini Flash 3.

The[Google GenAI SDK](https://ai.google.dev/gemini-api/docs/libraries)automatically handles the return of thought signatures for you. You only need to[manage thought signatures manually](https://ai.google.dev/gemini-api/docs/function-calling#thought-signatures)if you're modifying conversation history or using the REST API.

Other usage limitations to consider with function calling include:

- Signatures are returned from the model within other parts in the response, for example function calling or text parts.[Return the entire response](https://ai.google.dev/gemini-api/docs/function-calling#step-4)with all parts back to the model in subsequent turns.
- Don't concatenate parts with signatures together.
- Don't merge one part with a signature with another part without a signature.

## Pricing

| **Note:** **Summaries** are available in the[free and paid tiers](https://ai.google.dev/gemini-api/docs/pricing)of the API.**Thought signatures**will increase the input tokens you are charged when sent back as part of the request.

When thinking is turned on, response pricing is the sum of output tokens and thinking tokens. You can get the total number of generated thinking tokens from the`thoughtsTokenCount`field.  

### Python

    # ...
    print("Thoughts tokens:",response.usage_metadata.thoughts_token_count)
    print("Output tokens:",response.usage_metadata.candidates_token_count)

### JavaScript

    // ...
    console.log(`Thoughts tokens: ${response.usageMetadata.thoughtsTokenCount}`);
    console.log(`Output tokens: ${response.usageMetadata.candidatesTokenCount}`);

### Go

    // ...
    usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
    if err != nil {
      log.Fatal(err)
    }
    fmt.Println("Thoughts tokens:", string(usageMetadata.thoughts_token_count))
    fmt.Println("Output tokens:", string(usageMetadata.candidates_token_count))

Thinking models generate full thoughts to improve the quality of the final response, and then output[summaries](https://ai.google.dev/gemini-api/docs/thinking#summaries)to provide insight into the thought process. So, pricing is based on the full thought tokens the model needs to generate to create a summary, despite only the summary being output from the API.

You can learn more about tokens in the[Token counting](https://ai.google.dev/gemini-api/docs/tokens)guide.

## Best practices

This section includes some guidance for using thinking models efficiently. As always, following our[prompting guidance and best practices](https://ai.google.dev/gemini-api/docs/prompting-strategies)will get you the best results.

### Debugging and steering

- **Review reasoning**: When you're not getting your expected response from the thinking models, it can help to carefully analyze Gemini's thought summaries. You can see how it broke down the task and arrived at its conclusion, and use that information to correct towards the right results.

- **Provide Guidance in Reasoning** : If you're hoping for a particularly lengthy output, you may want to provide guidance in your prompt to constrain the[amount of thinking](https://ai.google.dev/gemini-api/docs/thinking#set-budget)the model uses. This lets you reserve more of the token output for your response.

### Task complexity

- **Easy Tasks (Thinking could be OFF):** For straightforward requests where complex reasoning isn't required, such as fact retrieval or classification, thinking is not required. Examples include:
  - "Where was DeepMind founded?"
  - "Is this email asking for a meeting or just providing information?"
- **Medium Tasks (Default/Some Thinking):** Many common requests benefit from a degree of step-by-step processing or deeper understanding. Gemini can flexibly use thinking capability for tasks like:
  - Analogize photosynthesis and growing up.
  - Compare and contrast electric cars and hybrid cars.
- **Hard Tasks (Maximum Thinking Capability):** For truly complex challenges, such as solving complex math problems or coding tasks, we recommend setting a high thinking budget. These types of tasks require the model to engage its full reasoning and planning capabilities, often involving many internal steps before providing an answer. Examples include:
  - Solve problem 1 in AIME 2025: Find the sum of all integer bases b \> 9 for which 17~b~is a divisor of 97~b~.
  - Write Python code for a web application that visualizes real-time stock market data, including user authentication. Make it as efficient as possible.

## Supported models, tools, and capabilities

Thinking features are supported on all 3 and 2.5 series models. You can find all model capabilities on the[model overview](https://ai.google.dev/gemini-api/docs/models)page.

Thinking models work with all of Gemini's tools and capabilities. This allows the models to interact with external systems, execute code, or access real-time information, incorporating the results into their reasoning and final response.

You can try examples of using tools with thinking models in the[Thinking cookbook](https://colab.sandbox.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_thinking.ipynb).

## What's next?

- Thinking coverage is available in our[OpenAI Compatibility](https://ai.google.dev/gemini-api/docs/openai#thinking)guide.

## GEMINI THOUGHT SIGNATURES

<br />

Thought signatures are encrypted representations of the model's internal thought process and are used to preserve reasoning context across multi-step interactions. When using thinking models (such as the Gemini 3 and 2.5 series), the API may return a`thoughtSignature`field within the[content parts](https://ai.google.dev/api/caching#Part)of the response (e.g.,`text`or`functionCall`parts).

As a general rule, if you receive a thought signature in a model response, you should pass it back exactly as received when sending the conversation history in the next turn.**When using Gemini 3 models, you must pass back thought signatures during function calling, otherwise you will get a validation error** (4xx status code). This includes when using the`minimal`[thinking level](https://ai.google.dev/gemini-api/docs/thinking#thinking-levels)setting for Gemini 3 Flash.
| **Note:** If you use the official[Google Gen AI SDKs](https://ai.google.dev/gemini-api/docs/libraries)and use the chat feature (or append the full model response object directly to history),**thought signatures are handled automatically**. You do not need to manually extract or manage them, or change your code.

## How it works

The graphic below visualizes the meaning of "turn" and "step" as they pertain to[function calling](https://ai.google.dev/gemini-api/docs/function-calling)in the Gemini API. A "turn" is a single, complete exchange in a conversation between a user and a model. A "step" is a finer-grained action or operation performed by the model, often as part of a larger process to complete a turn.

![Function calling turns and steps diagram](https://ai.google.dev/static/gemini-api/docs/images/fc-turns.png)

*This document focuses on handling function calling for Gemini 3 models. Refer to the[model behavior](https://ai.google.dev/gemini-api/docs/thought-signatures#model-behavior)section for discrepancies with 2.5.*

Gemini 3 returns thought signatures for all model responses (responses from the API) with a function call. Thought signatures show up in the following cases:

- When there are[parallel function](https://ai.google.dev/gemini-api/docs/function-calling#parallel_function_calling)calls, the first function call part returned by the model response will have a thought signature.
- When there are sequential function calls (multi-step), each function call will have a signature and you must pass all signatures back.
- Model responses without a function call will return a thought signature inside the last part returned by the model.

The following table provides a visualization for multi-step function calls, combining the definitions of turns and steps with the concept of signatures introduced above:

|----------|----------|-------------------------------------------------|---------------------------------|----------------------|
| **Turn** | **Step** | **User Request**                                | **Model Response**              | **FunctionResponse** |
| 1        | 1        | `request1 = user_prompt`                        | `FC1 + signature`               | `FR1`                |
| 1        | 2        | `request2 = request1 + (FC1 + signature) + FR1` | `FC2 + signature`               | `FR2`                |
| 1        | 3        | `request3 = request2 + (FC2 + signature) + FR2` | `text_output` <br /> `(no FCs)` | None                 |

## Signatures in function calling parts

When Gemini generates a`functionCall`, it relies on the`thought_signature`to process the tool's output correctly in the next turn.

- **Behavior** :
  - **Single Function Call** : The`functionCall`part will contain a`thought_signature`.
  - **Parallel Function Calls** : If the model generates parallel function calls in a response, the`thought_signature`is attached**only to the first** `functionCall`part. Subsequent`functionCall`parts in the same response will**not**contain a signature.
- **Requirement** : You**must**return this signature in the exact part where it was received when sending the conversation history back.
- **Validation** : Strict validation is enforced for all function calls within the current turn . (Only current turn is required; we don't validate on previous turns)
  - The API goes back in the history (newest to oldest) to find the most recent**User** message that contains standard content (e.g.,`text`) ( which would be the start of the current turn). This will not**be** a`functionResponse`.
  - **All** model`functionCall`turns occurring after that specific use message are considered part of the turn.
  - The**first** `functionCall`part in**each step** of the current turn**must** include its`thought_signature`.
  - If you omit a`thought_signature`for the first`functionCall`part in any step of the current turn, the request will fail with a 400 error.
- **If proper signatures are not returned, here is how you will error out**
  - `gemini-3-pro-preview`and`gemini-3-flash-preview`: Failure to include signatures will result in a 400 error. The verbiage will be of the form:
    - Function call`<Function Call>`in the`<index of contents array>`content block is missing a`thought_signature`. For example,*Function call`FC1`in the`1.`content block is missing a`thought_signature`.*

### Sequential function calling example

This section shows an example of multiple function calls where the user asks a complex question requiring multiple tasks.

Let's walk through a multiple-turn function calling example where the user asks a complex question requiring multiple tasks:`"Check flight status for AA100 and
book a taxi if delayed"`.

|----------|----------|---------------------------------------------------------------------------------------|------------------------------------|----------------------|
| **Turn** | **Step** | **User Request**                                                                      | **Model Response**                 | **FunctionResponse** |
| 1        | 1        | `request1="Check flight status for AA100 and book a taxi 2 hours before if delayed."` | `FC1 ("check_flight") + signature` | `FR1`                |
| 1        | 2        | `request2 `**=**` request1 `**+**` FC1 ("check_flight") + signature + FR1`            | `FC2("book_taxi") + signature`     | `FR2`                |
| 1        | 3        | `request3 `**=**` request2 `**+**` FC2 ("book_taxi") + signature + FR2`               | `text_output` <br /> `(no FCs)`    | `None`               |

The following code illustrates the sequence in the above table.

**Turn 1, Step 1 (User request)**  

    {
      "contents": [
        {
          "role": "user",
          "parts": [
            {
              "text": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
            }
          ]
        }
      ],
      "tools": [
        {
          "functionDeclarations": [
            {
              "name": "check_flight",
              "description": "Gets the current status of a flight",
              "parameters": {
                "type": "object",
                "properties": {
                  "flight": {
                    "type": "string",
                    "description": "The flight number to check"
                  }
                },
                "required": [
                  "flight"
                ]
              }
            },
            {
              "name": "book_taxi",
              "description": "Book a taxi",
              "parameters": {
                "type": "object",
                "properties": {
                  "time": {
                    "type": "string",
                    "description": "time to book the taxi"
                  }
                },
                "required": [
                  "time"
                ]
              }
            }
          ]
        }
      ]
    }

**Turn 1, Step 1 (Model response)**  

    {
    "content": {
            "role": "model",
            "parts": [
              {
                "functionCall": {
                  "name": "check_flight",
                  "args": {
                    "flight": "AA100"
                  }
                },
                "thoughtSignature": "<Signature A>"
              }
            ]
      }
    }

**Turn 1, Step 2 (User response - Sending tool outputs)** Since this user turn only contains a`functionResponse`(no fresh text), we are still in Turn 1. We must preserve`<Signature_A>`.  

    {
          "role": "user",
          "parts": [
            {
              "text": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
            }
          ]
        },
        {
            "role": "model",
            "parts": [
              {
                "functionCall": {
                  "name": "check_flight",
                  "args": {
                    "flight": "AA100"
                  }
                },
                "thoughtSignature": "<Signature A>" //Required and Validated
              }
            ]
          },
          {
            "role": "user",
            "parts": [
              {
                "functionResponse": {
                  "name": "check_flight",
                  "response": {
                    "status": "delayed",
                    "departure_time": "12 PM"
                    }
                  }
                }
            ]
    }

**Turn 1, Step 2 (Model)**The model now decides to book a taxi based on the previous tool output.  

    {
          "content": {
            "role": "model",
            "parts": [
              {
                "functionCall": {
                  "name": "book_taxi",
                  "args": {
                    "time": "10 AM"
                  }
                },
                "thoughtSignature": "<Signature B>"
              }
            ]
          }
    }

**Turn 1, Step 3 (User - Sending tool output)** To send the taxi booking confirmation, we must include signatures for**ALL** function calls in this loop (`<Signature A>`+`<Signature B>`).  

    {
          "role": "user",
          "parts": [
            {
              "text": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
            }
          ]
        },
        {
            "role": "model",
            "parts": [
              {
                "functionCall": {
                  "name": "check_flight",
                  "args": {
                    "flight": "AA100"
                  }
                },
                "thoughtSignature": "<Signature A>" //Required and Validated
              }
            ]
          },
          {
            "role": "user",
            "parts": [
              {
                "functionResponse": {
                  "name": "check_flight",
                  "response": {
                    "status": "delayed",
                    "departure_time": "12 PM"
                  }
                  }
                }
            ]
          },
          {
            "role": "model",
            "parts": [
              {
                "functionCall": {
                  "name": "book_taxi",
                  "args": {
                    "time": "10 AM"
                  }
                },
                "thoughtSignature": "<Signature B>" //Required and Validated
              }
            ]
          },
          {
            "role": "user",
            "parts": [
              {
                "functionResponse": {
                  "name": "book_taxi",
                  "response": {
                    "booking_status": "success"
                  }
                  }
                }
            ]
        }
    }

### Parallel function calling example

Let's walk through a parallel function calling example where the users asks`"Check weather in Paris and London"`to see where the model does validation.

| **Turn** | **Step** |                            **User Request**                            |            **Model Response**            | **FunctionResponse** |
|----------|----------|------------------------------------------------------------------------|------------------------------------------|----------------------|
| 1        | 1        | request1="Check the weather in Paris and London"                       | FC1 ("Paris") + signature FC2 ("London") | FR1                  |
| 1        | 2        | request 2**=** request1**+**FC1 ("Paris") + signature + FC2 ("London") | text_output (no FCs)                     | None                 |

The following code illustrates the sequence in the above table.

**Turn 1, Step 1 (User request)**  

    {
      "contents": [
        {
          "role": "user",
          "parts": [
            {
              "text": "Check the weather in Paris and London."
            }
          ]
        }
      ],
      "tools": [
        {
          "functionDeclarations": [
            {
              "name": "get_current_temperature",
              "description": "Gets the current temperature for a given location.",
              "parameters": {
                "type": "object",
                "properties": {
                  "location": {
                    "type": "string",
                    "description": "The city name, e.g. San Francisco"
                  }
                },
                "required": [
                  "location"
                ]
              }
            }
          ]
        }
      ]
    }

**Turn 1, Step 1 (Model response)**  

    {
      "content": {
        "parts": [
          {
            "functionCall": {
              "name": "get_current_temperature",
              "args": {
                "location": "Paris"
              }
            },
            "thoughtSignature": "<Signature_A>"// INCLUDED on First FC
          },
          {
            "functionCall": {
              "name": "get_current_temperature",
              "args": {
                "location": "London"
              }// NO signature on subsequent parallel FCs
            }
          }
        ]
      }
    }

**Turn 1, Step 2 (User response - Sending tool outputs)** We must preserve`<Signature_A>`on the first part exactly as received.  

    [
      {
        "role": "user",
        "parts": [
          {
            "text": "Check the weather in Paris and London."
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "functionCall": {
              "name": "get_current_temperature",
              "args": {
                "city": "Paris"
              }
            },
            "thought_signature": "<Signature_A>" // MUST BE INCLUDED
          },
          {
            "functionCall": {
              "name": "get_current_temperature",
              "args": {
                "city": "London"
              }
            }
          } // NO SIGNATURE FIELD
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "functionResponse": {
              "name": "get_current_temperature",
              "response": {
                "temp": "15C"
              }
            }
          },
          {
            "functionResponse": {
              "name": "get_current_temperature",
              "response": {
                "temp": "12C"
              }
            }
          }
        ]
      }
    ]

## Signatures in non`functionCall`parts

Gemini may also return`thought_signatures`in the final part of the response in non-function-call parts.

- **Behavior** : The final content part (`text, inlineData...`) returned by the model may contain a`thought_signature`.
- **Recommendation** : Returning these signatures is**recommended**to ensure the model maintains high-quality reasoning, especially for complex instruction following or simulated agentic workflows.
- **Validation** : The API does**not**strictly enforce validation. You won't receive a blocking error if you omit them, though performance may degrade.

### Text/In-context reasoning (No validation)

**Turn 1, Step 1 (Model response)**  

    {
      "role": "model",
      "parts": [
        {
          "text": "I need to calculate the risk. Let me think step-by-step...",
          "thought_signature": "<Signature_C>" // OPTIONAL (Recommended)
        }
      ]
    }

**Turn 2, Step 1 (User)**  

    [
      { "role": "user", "parts": [{ "text": "What is the risk?" }] },
      {
        "role": "model", 
        "parts": [
          {
            "text": "I need to calculate the risk. Let me think step-by-step...",
            // If you omit <Signature_C> here, no error will occur.
          }
        ]
      },
      { "role": "user", "parts": [{ "text": "Summarize it." }] }
    ]

## Signatures for OpenAI compatibility

The following examples shows how to handle thought signatures for a chat completion API using[OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai).

### Sequential function calling example

This is an example of multiple function calling where the user asks a complex question requiring multiple tasks.

Let's walk through a multiple-turn function calling example where the user asks`Check flight status for AA100 and book a taxi if delayed`and you can see what happens when the user asks a complex question requiring multiple tasks.

|----------|----------|---------------------------------------------------------------------------------|-----------------------------------------------------|----------------------|
| **Turn** | **Step** | **User Request**                                                                | **Model Response**                                  | **FunctionResponse** |
| 1        | 1        | `request1="Check the weather in Paris and London"`                              | `FC1 ("Paris") + signature` <br /> `FC2 ("London")` | `FR1`                |
| 1        | 2        | `request 2 `**=**` request1 `**+**` FC1 ("Paris") + signature + FC2 ("London")` | `text_output` <br /> `(no FCs)`                     | `None`               |

The following code walks through the given sequence.

**Turn 1, Step 1 (User Request)**  

    {
      "model": "google/gemini-3-pro-preview",
      "messages": [
        {
          "role": "user",
          "content": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
        }
      ],
      "tools": [
        {
          "type": "function",
          "function": {
            "name": "check_flight",
            "description": "Gets the current status of a flight",
            "parameters": {
              "type": "object",
              "properties": {
                "flight": {
                  "type": "string",
                  "description": "The flight number to check."
                }
              },
              "required": [
                "flight"
              ]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "book_taxi",
            "description": "Book a taxi",
            "parameters": {
              "type": "object",
              "properties": {
                "time": {
                  "type": "string",
                  "description": "time to book the taxi"
                }
              },
              "required": [
                "time"
              ]
            }
          }
        }
      ]
    }

**Turn 1, Step 1 (Model Response)**  

    {
          "role": "model",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature A>"
                  }
                },
                "function": {
                  "arguments": "{\"flight\":\"AA100\"}",
                  "name": "check_flight"
                },
                "id": "function-call-1",
                "type": "function"
              }
            ]
        }

**Turn 1, Step 2 (User Response - Sending Tool Outputs)**

Since this user turn only contains a`functionResponse`(no fresh text), we are still in Turn 1 and must preserve`<Signature_A>`.  

    "messages": [
        {
          "role": "user",
          "content": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
        },
        {
          "role": "model",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature A>" //Required and Validated
                  }
                },
                "function": {
                  "arguments": "{\"flight\":\"AA100\"}",
                  "name": "check_flight"
                },
                "id": "function-call-1",
                "type": "function"
              }
            ]
        },
        {
          "role": "tool",
          "name": "check_flight",
          "tool_call_id": "function-call-1",
          "content": "{\"status\":\"delayed\",\"departure_time\":\"12 PM\"}"                 
        }
      ]

**Turn 1, Step 2 (Model)**

The model now decides to book a taxi based on the previous tool output.  

    {
    "role": "model",
    "tool_calls": [
    {
    "extra_content": {
    "google": {
    "thought_signature": "<Signature B>"
    }
                },
                "function": {
                  "arguments": "{\"time\":\"10 AM\"}",
                  "name": "book_taxi"
                },
                "id": "function-call-2",
                "type": "function"
              }
           ]
    }

**Turn 1, Step 3 (User - Sending Tool Output)**

To send the taxi booking confirmation, we must include signatures for ALL function calls in this loop (`<Signature A>`+`<Signature B>`).  

    "messages": [
        {
          "role": "user",
          "content": "Check flight status for AA100 and book a taxi 2 hours before if delayed."
        },
        {
          "role": "model",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature A>" //Required and Validated
                  }
                },
                "function": {
                  "arguments": "{\"flight\":\"AA100\"}",
                  "name": "check_flight"
                },
                "id": "function-call-1d6a1a61-6f4f-4029-80ce-61586bd86da5",
                "type": "function"
              }
            ]
        },
        {
          "role": "tool",
          "name": "check_flight",
          "tool_call_id": "function-call-1d6a1a61-6f4f-4029-80ce-61586bd86da5",
          "content": "{\"status\":\"delayed\",\"departure_time\":\"12 PM\"}"                 
        },
        {
          "role": "model",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature B>" //Required and Validated
                  }
                },
                "function": {
                  "arguments": "{\"time\":\"10 AM\"}",
                  "name": "book_taxi"
                },
                "id": "function-call-65b325ba-9b40-4003-9535-8c7137b35634",
                "type": "function"
              }
            ]
        },
        {
          "role": "tool",
          "name": "book_taxi",
          "tool_call_id": "function-call-65b325ba-9b40-4003-9535-8c7137b35634",
          "content": "{\"booking_status\":\"success\"}"
        }
      ]

### Parallel function calling example

Let's walk through a parallel function calling example where the users asks`"Check weather in Paris and London"`and you can see where the model does validation.

|----------|----------|---------------------------------------------------------------------------------|-----------------------------------------------------|----------------------|
| **Turn** | **Step** | **User Request**                                                                | **Model Response**                                  | **FunctionResponse** |
| 1        | 1        | `request1="Check the weather in Paris and London"`                              | `FC1 ("Paris") + signature` <br /> `FC2 ("London")` | `FR1`                |
| 1        | 2        | `request 2 `**=**` request1 `**+**` FC1 ("Paris") + signature + FC2 ("London")` | `text_output` <br /> `(no FCs)`                     | `None`               |

Here's the code to walk through the given sequence.

**Turn 1, Step 1 (User Request)**  

    {
      "contents": [
        {
          "role": "user",
          "parts": [
            {
              "text": "Check the weather in Paris and London."
            }
          ]
        }
      ],
      "tools": [
        {
          "functionDeclarations": [
            {
              "name": "get_current_temperature",
              "description": "Gets the current temperature for a given location.",
              "parameters": {
                "type": "object",
                "properties": {
                  "location": {
                    "type": "string",
                    "description": "The city name, e.g. San Francisco"
                  }
                },
                "required": [
                  "location"
                ]
              }
            }
          ]
        }
      ]
    }

**Turn 1, Step 1 (Model Response)**  

    {
    "role": "assistant",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature A>" //Signature returned
                  }
                },
                "function": {
                  "arguments": "{\"location\":\"Paris\"}",
                  "name": "get_current_temperature"
                },
                "id": "function-call-f3b9ecb3-d55f-4076-98c8-b13e9d1c0e01",
                "type": "function"
              },
              {
                "function": {
                  "arguments": "{\"location\":\"London\"}",
                  "name": "get_current_temperature"
                },
                "id": "function-call-335673ad-913e-42d1-bbf5-387c8ab80f44",
                "type": "function" // No signature on Parallel FC
              }
            ]
    }

**Turn 1, Step 2 (User Response - Sending Tool Outputs)**

You must preserve`<Signature_A>`on the first part exactly as received.  

    "messages": [
        {
          "role": "user",
          "content": "Check the weather in Paris and London."
        },
        {
          "role": "assistant",
            "tool_calls": [
              {
                "extra_content": {
                  "google": {
                    "thought_signature": "<Signature A>" //Required
                  }
                },
                "function": {
                  "arguments": "{\"location\":\"Paris\"}",
                  "name": "get_current_temperature"
                },
                "id": "function-call-f3b9ecb3-d55f-4076-98c8-b13e9d1c0e01",
                "type": "function"
              },
              {
                "function": { //No Signature
                  "arguments": "{\"location\":\"London\"}",
                  "name": "get_current_temperature"
                },
                "id": "function-call-335673ad-913e-42d1-bbf5-387c8ab80f44",
                "type": "function"
              }
            ]
        },
        {
          "role":"tool",
          "name": "get_current_temperature",
          "tool_call_id": "function-call-f3b9ecb3-d55f-4076-98c8-b13e9d1c0e01",
          "content": "{\"temp\":\"15C\"}"
        },    
        {
          "role":"tool",
          "name": "get_current_temperature",
          "tool_call_id": "function-call-335673ad-913e-42d1-bbf5-387c8ab80f44",
          "content": "{\"temp\":\"12C\"}"
        }
      ]

## FAQs

1. **How do I transfer history from a different model to Gemini 3 with a function call part in the current turn and step? I need to provide function call parts that were not generated by the API and therefore don't have an associated thought signature?**

   While injecting custom function call blocks into the request is strongly discouraged, in cases where it can't be avoided, e.g. providing information to the model on function calls and responses that were executed deterministically by the client, or transferring a trace from a different model that does not include thought signatures, you can set the following dummy signatures of either`"context_engineering_is_the_way_to_go"`or`"skip_thought_signature_validator"`in the thought signature field to skip validation.
2. **I am sending back interleaved parallel function calls and responses and the API is returning a 400. Why?**

   When the API returns parallel function calls "FC1 + signature, FC2", the user response expected is "FC1+ signature, FC2, FR1, FR2". If you have them interleaved as "FC1 + signature, FR1, FC2, FR2" the API will return a 400 error.
3. **When streaming and the model is not returning a function call I can't find the thought signature**

   During a model response not containing a FC with a streaming request, the model may return the thought signature in a part with an empty text content part. It is advisable to parse the entire request until the`finish_reason`is returned by the model.

## Thought signatures for different models

Gemini 3 Pro and Flash, Gemini 3 Pro Image and Gemini 2.5 models each behave differently with thought signatures. For Gemini 3 Pro Image see the thinking process section of the[image generation](https://ai.google.dev/gemini-api/docs/image-generation#thinking-process)guide.

Gemini 3 models and Gemini 2.5 models behave differently with thought signatures in function calls:

- If there are function calls in a response,
  - Gemini 3 will always have the signature on the first function call part. It is**mandatory**to return that part.
  - Gemini 2.5 will have the signature in the first part (regardless of type). It is**optional**to return that part.
- If there are no function calls in a response,
  - Gemini 3 will have the signature on the last part if the model generates a thought.
  - Gemini 2.5 won't have a signature in any part.

For Gemini 2.5 models thought signature behavior, refer to the[Thinking](https://ai.google.dev/gemini-api/docs/thinking#signatures)page.