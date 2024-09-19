import dotenv from 'dotenv'
dotenv.config();
const secrets = {
    geminiApiKey: process.env.geminiApiKey,
    aiPrompt: `Analyze the provided image and identify any questions or content. The questions can come from any subject, including math, physics, chemistry, biology, science, English, and common-sense topics. If an answer exists but is incorrect or outdated, specify a rectangle to cover the old answer with its origin point and dimensions. Provide answers using the following JSON schema:
{
    "hasQuestion": true
    "handWritingSize": "Describe the size of the handwriting text in the image (e.g. 24px, 36px,48px ) USE PIXELS VALUS EXCEPT THE "px" part and the 2.5x your estimated font size.",
    "answers": [
        {
            "id": 1,
            "coordinateX": "Specify the X coordinate where the answer should be placed on the image (be as precise as possible).",
            "coordinateY": "Specify the Y coordinate where the answer should be placed on the image (be as precise as possible).",
            "fontSize": "Estimate the font size that matches the handwriting or text in the image.",
            "answer": "Provide the answer text here.",
            "explaination": "Provide the explaination of the ans text here. should be short and super concise around 100 characters.",
            "rectangle": [
                "true if covering old answer", 
                "X coordinate of the rectangle's origin or middle point", 
                "Y coordinate of the rectangle's origin or middle point", 
                "width of the rectangle", 
                "height of the rectangle"
            ]
        },
        //if theres more than one answer in the image you can add more here in this array
    ]
}
Instructions:

Detect all questions in the image, which could come from any subject or common-sense questions.
If an old answer is incorrect or outdated, provide a rectangle to cover it, specifying the origin point, width, and height.
Provide concise answers for each question, focusing only on the requested information (e.g., for a triangle, just provide the base if that's the focus)
For equations, provide only the final answer.
For tables, provide key trends or the most relevant data.
For visual elements like diagrams, only mention the requested detail.
Always provide answers in a single term (e.g., "8") if possible.This is strictly said to follow and should be only broken if really needed. AND YOU WILL STRICKTLY WILL NOT USE ANY KIND OF FORMATTING AND MARKDOWN OR CODE BLOCK
`,
}
export default secrets

/*
Topics:::
All number values should be in integer and floating point numbers other then the answer.
Detect all questions in the image, which could come from any subject or be common-sense questions.
If an old answer is incorrect or outdated, provide a rectangle to cover it, specifying the origin point, width, and height.
Provide detailed answers for each question, ensuring the coordinates and font size match the context.
Rate the handwriting quality and size if handwriting is detected.
For equations, attempt to parse and evaluate them, providing step-by-step solutions if possible.
For graphs or charts, analyze the data points and describe trends or patterns.
For scientific notation, convert between standard and exponential forms.
For chemical formulas, identify compounds and provide molecular weights.
For tables, extract data and summarize statistics or trends.
For mixed-language content, detect and translate relevant terms or phrases.
For handwritten content, apply advanced recognition techniques to improve accuracy.
For complex calculations, break down problems into manageable steps and explain reasoning.
For visual elements like diagrams or flowcharts, interpret and describe their meaning.
For multi-part questions, address each part separately and clearly indicate relationships between parts.
For open-ended questions, provide thoughtful, well-reasoned responses that demonstrate understanding.
For comparedly large answers, provide a concise summary and let the fontsize be smaller .



------
\\/\// instructions : 
  \/
  \/
Analyze the provided image and identify any questions or content. The questions can come from any subject, including math, physics, chemistry, biology, science, English, and common-sense topics. If an answer exists but is incorrect or outdated, specify a rectangle to cover the old answer with its origin point and dimensions. Provide answers using the following JSON schema:
{
    "hasQuestion": true,
    "handWritingScore": "Rate the handwriting quality on a scale from 0 to 3 (where 0 is poor and 3 is excellent). Only rate if handwriting is present in the image.",
    "handWritingSize": "Describe the size of the handwriting text in the image (e.g., small, medium, large).",
    "answers": [
        {
            "id": 1,
            "coordinateX": "Specify the X coordinate where the answer should be placed on the image (be as precise as possible).",
            "coordinateY": "Specify the Y coordinate where the answer should be placed on the image (be as precise as possible).",
            "fontSize": "Estimate the font size that matches the handwriting or text in the image.",
            "answer": "Provide the answer text here.",
            "explaination": "Provide the explaination of the ans text here. should be short and super concise around 100 characters.",
            "rectangle": [
                "true if covering old answer", 
                "X coordinate of the rectangle's origin or middle point", 
                "Y coordinate of the rectangle's origin or middle point", 
                "width of the rectangle", 
                "height of the rectangle"
            ]
        },
        //if theres more than one answer in the image you can add more here in this array
    ]
}
Instructions:

Detect all questions in the image, which could come from any subject or common-sense questions.
If an old answer is incorrect or outdated, provide a rectangle to cover it, specifying the origin point, width, and height.
Provide concise answers for each question, focusing only on the requested information (e.g., for a triangle, just provide the base if that's the focus).
Rate the handwriting quality and size if handwriting is detected.
For equations, provide only the final answer.
For tables, provide key trends or the most relevant data.
For visual elements like diagrams, only mention the requested detail.
Always provide answers in a single term (e.g., "8") if possible.This is strictly said to follow and should be only broken if really needed.
*/
