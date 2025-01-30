// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('deepsk.startChat', () => {
    const panel = vscode.window.createWebviewPanel(
      'deepChat',
      'Deep Seek Chat',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage(async (message: any) => {
      if (message.command === 'chat') {
        const userPrompt = message.text;
        let responseText = '';

        try {
          const streamResponse = await ollama.chat({
            model: 'deepseek-r1:14b',
            messages: userPrompt,
            stream: true,
          });

          for await (const part of streamResponse) {
            responseText += part.message.content;
          }
          panel.webview.postMessage({
            command: 'chatResponse',
            text: responseText,
          });
        } catch (e) {
          panel.webview.postMessage({
            command: 'chatResponse',
            text: `Error: ${String(e)}`,
          });
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/default.min.css">
			<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js"></script>
			<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <style>
                :root {
                    --bg-color: #1e1e1e;
                    --text-color: #ffffff;
                    --user-message-bg: #007bff;
                    --response-message-bg: #333333;
                    --border-color: #444;
                    --input-bg: #252526;
                    --button-bg: #007bff;
                    --button-hover-bg: #0056b3;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html, body {
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }

                body {
                    font-family: sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .chat-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column-reverse;
                    border: 1px solid var(--border-color);
                    background: var(--bg-color);
                }

                .messages {
                    flex: 1;
                    left: 0;
                    right: 0;
                    padding: 15px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    transition: padding-bottom 0.2s ease-in-out;
                }

                .message {
                    padding: 10px 15px;
                    border-radius: 12px;
                    margin: 5px 0;
                    max-width: 90%;
                    width: fit-content;
                }

                .user-message {
                    background: var(--user-message-bg);
                    color: white;
                    align-self: flex-start;
                }

                .response-message {
                    background: var(--response-message-bg);
                    color: white;
                    align-self: flex-end;
                }

				.response-think-message {
					width: 100%;
				}

                .input-container {
                    display: flex;
                    align-items: flex-start;
                    padding: 10px;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-color);
                    width: 100%;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    transition: height 0.2s ease-in-out;
                }

                .input-box {
                    flex: 1;
                    border: none;
                    border-radius: 8px;
                    padding: 10px;
                    font-size: 16px;
                    line-height: 1.5;
                    min-height: 40px;
                    max-height: 150px;
                    height: 40px;
                    overflow-y: hidden; /* Fix scrollbar issue */
                    word-wrap: break-word;
                    white-space: pre-wrap;
                    background: var(--input-bg);
                    color: var(--text-color);
                    margin-right: 10px;
                }

                .input-box:empty::before {
                    content: "Type your message...";
                    color: gray;
                }

                .input-box:focus {
                    outline: none;
                }

				.input-box:hover {
					cursor: text;
				}

                .send-button {
                    background: var(--button-bg);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    min-width: 70px;
                    align-self: center;
                }

                .send-button:hover {
                    background: var(--button-hover-bg);
                }

				.accordion {
					background: #444;
					color: #fff;
					padding: 10px;
					border: none;
					cursor: pointer;
					width: 100%;
					text-align: left;
					font-size: 16px;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
					margin-top: 5px;  /* Space between text and accordion button */
					margin-bottom: 5px;
				}

				.accordion.active {
					background: #555;
					margin-bottom: 0px;
                    border-bottom-left-radius: 0px;
                    border-bottom-right-radius: 0px;
				}

				.panel {
					padding: 10px;
					padding: 10px;
					display: none;
					background-color: #222;
					color: #ddd;
					border-left: 3px solid #007bff;
					margin-bottom: 5px;
				}

				#content {
					max-width: 800px; /* Limit the width of the content */
					margin: 0 auto;   /* Center the content */
					padding: 20px;
					font-family: Arial, sans-serif;
					line-height: 1.6;
				}

				h1, h2, h3, h4, h5, h6 {
					margin-top: 1em;
					margin-bottom: 0.5em;
				}

				samp {
					margin-top: 10px;
					background:rgba(131, 129, 129, 0.25);
				}

				pre {
					margin-top: 10px;
					background:rgba(131, 129, 129, 0.25);
				}

				code {
					font-family: Consolas, monospace;
					background:rgba(131, 129, 129, 0.25);
					border-radius: 3px;
					margin-top: 10px;
					margin-bottom: 10px; /* Optional, for spacing between list items */
				}

				/* Add margin/padding to the unordered list (ul) */
				ul {
					margin-left: 20px; /* Adjust this value as needed */
					margin-bottom: 10px; /* Optional, for spacing between list items */
				}
				ol {
					margin-left: 20px; /* Adjust this value as needed */
					margin-bottom: 10px; /* Optional, for spacing between list items */
				}
            </style>
        </head>
        <body>

			<div class="chat-container">
				<div class="input-container">
					<div class="input-box" contenteditable="true"></div>
					<button class="send-button">Send</button>
				</div>
				<div class="messages"></div>
			</div>

            <script>
                const vscode = acquireVsCodeApi();
				let session_memory = [];
                const inputDiv = document.querySelector(".input-box");
                const messagesDiv = document.querySelector(".messages");
                const sendButton = document.querySelector(".send-button");
                const inputContainer = document.querySelector(".input-container");

                function sendMessage() {
                    const message = inputDiv.innerText.trim();
                    if (message) {
                        // Append user message to chat
                        const userMessageElement = document.createElement("div");
                        userMessageElement.classList.add("message", "user-message");
						session_memory.push({
							"role": "user",
							"content": message
						});
                        userMessageElement.innerText = message;
                        messagesDiv.appendChild(userMessageElement);
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;

                        // Send message to VS Code extension
                        vscode.postMessage({ command: 'chat', text: session_memory });

                        // Clear input and reset height
                        inputDiv.innerHTML = "";
                        inputDiv.style.height = "40px";
                        inputDiv.style.overflowY = "hidden"; // Ensure no scrollbar
                    }
                }

                // Auto-expand input as user types
                inputDiv.addEventListener("input", function () {
                    this.style.height = "40px"; // Reset height
                    this.style.height = Math.min(this.scrollHeight, 150) + "px"; // Expand but limit max height
                    
                    // Only allow scrollbar if the input height reaches its max
                    this.style.overflowY = (this.scrollHeight > 150) ? "auto" : "hidden";
                });

                inputDiv.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                    }
                });

                sendButton.addEventListener("click", sendMessage);

                window.addEventListener("message", (e) => {
                    const { command, text } = e.data;
                    if (command === "chatResponse") {
						const reg = new RegExp("<think>([\\\\s\\\\S]*?)<\\\\/think>");
						const thinkMatch = text.match(reg);
						let messageContent = text;
						messageContent = messageContent.replace(thinkMatch ? thinkMatch[0] : '', '').replace('\\n\\n', '');
						const isThinking = thinkMatch && thinkMatch[1].length > 2;
						// Create the response message element
						const responseMessageElement = document.createElement("div");
						responseMessageElement.classList.add("message", "response-message");

						// Add the regular response text
						const responseTextElement = document.createElement("div");
						session_memory.push({
							"role": "assistant",
							"content": messageContent
						});

						const parsedHtml = marked.parse(messageContent);

						responseTextElement.innerHTML = parsedHtml;

						responseTextElement.querySelectorAll('pre code').forEach((block) => {
							hljs.highlightBlock(block);
						});

						// Add the accordion for the "think" content, if it exists
						if (isThinking) {
							responseMessageElement.classList.add("response-think-message");
							const accordion = document.createElement('button');
							accordion.classList.add('accordion');
							accordion.innerText = 'Thought Process';
							const panel = document.createElement('div');
							panel.classList.add('panel');
							panel.style.display = "none";
							panel.innerText = thinkMatch[1];

							// Append accordion to response message
							responseMessageElement.appendChild(accordion);
							responseMessageElement.appendChild(panel);

							// Toggle accordion on click
							accordion.addEventListener('click', () => {
								accordion.classList.toggle('active');
								panel.style.display = panel.style.display === "block" ? "none" : "block";
							});
						}
						responseMessageElement.appendChild(responseTextElement);
						// Append the entire response message to the messages div
						messagesDiv.appendChild(responseMessageElement);
						messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                });
            </script>
        </body>
    </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
