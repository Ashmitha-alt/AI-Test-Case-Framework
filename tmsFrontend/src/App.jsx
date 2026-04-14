import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080/api/testcases";

const initialForm = {
  itemType: "TEST_CASE",
  title: "",
  summary: "",
  description: "",
  priority: "",
  testType: "",
  preconditions: "",
  environment: "",
  tags: "",
};

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [hint, setHint] = useState("");
  const [hintType, setHintType] = useState("info");

  const isFormValid = useMemo(() => {
    return Boolean(
      formData.title.trim() &&
        formData.description.trim() &&
        formData.priority &&
        formData.testType
    );
  }, [formData]);

  const showMessage = (message, type = "info") => {
    setHint(message);
    setHintType(type);
  };

  const fetchTestCases = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setTestCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load error:", err);
      setTestCases([]);
      showMessage("Could not load existing test cases.", "error");
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  useEffect(() => {
    const text = formData.summary.trim();

    if (text.length < 5) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      generateAiTestCase(text);
    }, 700);

    return () => clearTimeout(timer);
  }, [formData.summary]);

  const generateAiTestCase = async (summary) => {
    if (!summary) return;

    setLoadingAi(true);
    setAiSuggestion(null);

    try {
      const res = await fetch(`${API_BASE}/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });

      const data = await res.json();

      const description =
        [
          ...(data.suggestedSteps || []).map((step, index) => `${index + 1}. ${step}`),
          data.suggestedExpectedResult
            ? `Expected Result: ${data.suggestedExpectedResult}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

      setAiSuggestion({
        title: data.suggestedTitle || "",
        description: description || "",
        priority: data.suggestedPriority || "",
        testType: data.suggestedTestType || "",
      });
    } catch (err) {
      console.error("AI error:", err);
      setAiSuggestion({ error: "AI generation failed ❌" });
    } finally {
      setLoadingAi(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion || aiSuggestion.error) return;

    setFormData((prev) => ({
      ...prev,
      title: aiSuggestion.title || "",
      description: aiSuggestion.description || "",
      priority: aiSuggestion.priority || "",
      testType: aiSuggestion.testType || "",
    }));

    showMessage("AI suggestion applied successfully.", "success");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectToggle = (group, value) => {
    setFormData((prev) => ({ ...prev, [group]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      itemType: formData.itemType,
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      testType: formData.testType,
      preconditions: formData.preconditions.trim(),
      environment: formData.environment.trim(),
      tags: formData.tags.trim(),
    };

    try {
      setSaving(true);

      const method = editingId !== null ? "PUT" : "POST";
      const url = editingId !== null ? `${API_BASE}/${editingId}` : API_BASE;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saved = await response.json();

      showMessage(
        editingId !== null
          ? `Updated test case ID ${saved.id}`
          : `Created test case ID ${saved.id}`,
        "success"
      );

      setEditingId(null);
      setFormData(initialForm);
      setAiSuggestion(null);
      setShowAdvanced(false);
      await fetchTestCases();
    } catch (err) {
      console.error("Save error:", err);
      showMessage("Failed to save test case.", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteTestCase = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      await fetchTestCases();
      showMessage("Test case deleted.", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showMessage("Failed to delete test case.", "error");
    }
  };

  const startEdit = (tc) => {
    setEditingId(tc.id);
    setFormData({
      itemType: tc.itemType || "TEST_CASE",
      title: tc.title || "",
      summary: tc.summary || "",
      description: tc.description || "",
      priority: tc.priority || "",
      testType: tc.testType || "",
      preconditions: tc.preconditions || "",
      environment: tc.environment || "",
      tags: tc.tags || "",
    });
    setShowAdvanced(true);
    showMessage(`Editing test case ID ${tc.id}`, "info");
  };

  return (
    <div className="app-shell">
      <div className="top-glow top-glow-left" />
      <div className="top-glow top-glow-right" />

      <form className="page" onSubmit={handleSubmit}>
        <header className="hero">
          <div className="hero-badge">AI Test Management</div>
          <h1>Build test cases faster with AI assistance</h1>
          <p>
            Describe the scenario in plain English and let the system suggest a
            title, priority, and test type.
          </p>
        </header>

        <main className="content">
          <section className="card left">
            <div className="form-top">
              <div className="form-copy">
                <h2>Create Test Artifact</h2>
                <p>Fill the required fields and refine with AI help.</p>
              </div>

              <div className="type-switcher">
                {["TEST_CASE", "DEFECT", "TASK"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={
                      formData.itemType === type ? "type-pill active" : "type-pill"
                    }
                    onClick={() => selectToggle("itemType", type)}
                  >
                    {type === "TEST_CASE" ? "Test Case" : type}
                  </button>
                ))}
              </div>
            </div>

            <label className="label">Suggested Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title will be auto-generated"
            />

            <label className="label">Test Case Summary</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Short one-line summary"
            />

            <label className="label">📝 Describe in plain English</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the test scenario in detail"
            />

            <div className="row">
              <div className="toggle-group">
                <label>Priority</label>
                <div className="buttons">
                  {["High", "Medium", "Low"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={formData.priority === p ? "active" : ""}
                      onClick={() => selectToggle("priority", p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="toggle-group">
                <label>Test Type</label>
                <div className="buttons">
                  {["Functional", "Negative"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={formData.testType === t ? "active" : ""}
                      onClick={() => selectToggle("testType", t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="link-btn"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? "▼ Hide Advanced Details" : "▶ Advanced Details"}
            </button>

            {showAdvanced && (
              <div className="advanced-grid">
                <input
                  type="text"
                  name="preconditions"
                  value={formData.preconditions}
                  onChange={handleChange}
                  placeholder="Preconditions"
                />
                <input
                  type="text"
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  placeholder="Environment (QA / UAT)"
                />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Tags"
                />
              </div>
            )}

            <p className={`hint hint-${hintType}`}>{hint}</p>

            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setFormData(initialForm);
                  setEditingId(null);
                  setShowAdvanced(false);
                  setAiSuggestion(null);
                  showMessage("Draft cleared.", "info");
                }}
              >
                Reset
              </button>

              <button
                type="submit"
                className="primary"
                disabled={!isFormValid || saving}
              >
                {saving ? "Saving..." : editingId !== null ? "Update" : "Create"}
              </button>
            </div>
          </section>

          <aside className="card right">
            <div className="section-head">
              <div>
                <h2>Live Suggestions</h2>
                <p>AI-generated guidance updates here.</p>
              </div>
            </div>

            <div className="suggestion-box">
              {loadingAi && <div className="ai-loader">🤖 Generating...</div>}

              {!loadingAi && !aiSuggestion && (
                <div className="suggestion-item">
                  Start typing a summary to get AI suggestions.
                </div>
              )}

              {!loadingAi && aiSuggestion?.error && (
                <div className="suggestion-item error">{aiSuggestion.error}</div>
              )}

              {!loadingAi && aiSuggestion && !aiSuggestion.error && (
                <>
                  <div className="suggestion-card">
                    <div className="suggestion-label">Suggested Title</div>
                    <div className="suggestion-value">{aiSuggestion.title}</div>
                  </div>

                  <div className="suggestion-card">
                    <div className="suggestion-label">Description</div>
                    <div className="suggestion-value prewrap">
                      {aiSuggestion.description}
                    </div>
                  </div>

                  <div className="suggestion-card-row">
                    <div className="suggestion-card">
                      <div className="suggestion-label">Priority</div>
                      <div className="suggestion-chip">{aiSuggestion.priority}</div>
                    </div>

                    <div className="suggestion-card">
                      <div className="suggestion-label">Test Type</div>
                      <div className="suggestion-chip">{aiSuggestion.testType}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="apply-btn"
                    onClick={applySuggestion}
                  >
                    Apply Suggestion
                  </button>
                </>
              )}
            </div>
          </aside>
        </main>

        <section className="card list-card">
          <div className="section-head">
            <div>
              <h2>Existing Test Cases</h2>
              <p>View, edit, or delete saved cases.</p>
            </div>
            <span className="count">{testCases.length} items</span>
          </div>

          <div className="table-like-list">
            {testCases.length === 0 ? (
              <div className="empty-state">No test cases yet.</div>
            ) : (
              testCases.map((tc) => (
                <div className="list-row" key={tc.id}>
                  <div className="row-main">
                    <div className="row-title">{tc.title}</div>
                    <div className="row-meta">
                      <span className="meta-chip">{tc.priority || "No priority"}</span>
                      <span className="meta-chip subtle">
                        {tc.testType || "No test type"}
                      </span>
                      <span className="meta-chip subtle">
                        {tc.itemType || "TEST_CASE"}
                      </span>
                    </div>
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => startEdit(tc)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteTestCase(tc.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </form>
    </div>
  );
}

export default App;