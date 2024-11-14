import React, { useState } from "react";
import { marked } from "marked";
import { useSnackbar } from "notistack";

const App = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [renderType, setRenderType] = useState("html"); // Either 'html' or 'markdown'

  // Access the enqueueSnackbar function from notistack
  const { enqueueSnackbar } = useSnackbar();

  // Fetch data from API endpoint using fetch
  const fetchApiData = async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setJsonData(JSON.stringify(data, null, 2));

      // Display success notification
      enqueueSnackbar("Data fetched successfully", { variant: "success" });

      setJsonError("");
    } catch (error) {
      enqueueSnackbar("Error fetching data", { variant: "error" });
      setJsonError("Invalid API URL or request failed.");
    }
  };

  // Handle manual JSON input and error checking
  const handleJsonChange = (event) => {
    try {
      const newJson = event.target.value;
      setJsonData(newJson);
      JSON.parse(newJson);
      setJsonError("");
    } catch (error) {
      setJsonError("Malformed JSON data");
      enqueueSnackbar("Malformed JSON data", { variant: "error" });
    }
  };

  // Recursive function to render nested objects and arrays
  const renderTableData = (data) => {
    if (typeof data === "object" && !Array.isArray(data)) {
      return (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {Object.entries(data).map(([key, value], index) => (
              <tr key={index}>
                <th>{key}</th>
                <td>{renderTableData(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (Array.isArray(data)) {
      return (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {data.length > 0 &&
                typeof data[0] === "object" &&
                Object.keys(data[0]).map((key, index) => <th key={index}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {typeof item === "object" ? (
                  Object.values(item).map((value, colIndex) => (
                    <td key={colIndex}>{renderTableData(value)}</td>
                  ))
                ) : (
                  <td>{item}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return <span>{data}</span>; // Simple value
    }
  };

  // Render JSON data as HTML or Markdown
  const renderJson = () => {
    try {
      const parsedJson = JSON.parse(jsonData);

      if (renderType === "html") {
        // Render as HTML table
        return <div>{renderTableData(parsedJson)}</div>;
      } else {
        // Render as Markdown
        const markdown = marked(JSON.stringify(parsedJson, null, 2));
        return <div dangerouslySetInnerHTML={{ __html: markdown }} />;
      }
    } catch (error) {
      return <p>Invalid JSON format</p>;
    }
  };

  return (
    <div className="app">
      <h1>API and JSON Interaction Tool</h1>

      {/* API Input */}
      <div>
        <input
          type="text"
          placeholder="Enter API Endpoint"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
        <button onClick={fetchApiData}>GET</button>
      </div>

      {/* JSON Display / Manual Edit */}
      <div>
        <h2>JSON Data</h2>
        <textarea
          value={jsonData}
          onChange={handleJsonChange}
          rows="10"
          cols="50"
        />
        {jsonError && <p style={{ color: "red" }}>{jsonError}</p>}
      </div>

      {/* Select Render Type */}
      <div>
        <label>
          <input
            type="radio"
            name="renderType"
            value="html"
            checked={renderType === "html"}
            onChange={() => setRenderType("html")}
          />
          Render as HTML
        </label>
        <label>
          <input
            type="radio"
            name="renderType"
            value="markdown"
            checked={renderType === "markdown"}
            onChange={() => setRenderType("markdown")}
          />
          Render as Markdown
        </label>
      </div>

      {/* Render Output */}
      <div>
        <h2>Rendered Output</h2>
        {renderJson()}
      </div>
    </div>
  );
};

export default App;
