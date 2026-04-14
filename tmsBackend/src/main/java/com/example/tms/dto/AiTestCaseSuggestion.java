package com.example.tms.dto;

import java.util.List;

public class AiTestCaseSuggestion {

    private String suggestedTitle;
    private List<String> suggestedSteps;
    private String suggestedExpectedResult;
    private String suggestedPriority;
    private String suggestedTestType;
    private double confidence;

    public String getSuggestedTitle() {
        return suggestedTitle;
    }

    public void setSuggestedTitle(String suggestedTitle) {
        this.suggestedTitle = suggestedTitle;
    }

    public List<String> getSuggestedSteps() {
        return suggestedSteps;
    }

    public void setSuggestedSteps(List<String> suggestedSteps) {
        this.suggestedSteps = suggestedSteps;
    }

    public String getSuggestedExpectedResult() {
        return suggestedExpectedResult;
    }

    public void setSuggestedExpectedResult(String suggestedExpectedResult) {
        this.suggestedExpectedResult = suggestedExpectedResult;
    }

    public String getSuggestedPriority() {
        return suggestedPriority;
    }

    public void setSuggestedPriority(String suggestedPriority) {
        this.suggestedPriority = suggestedPriority;
    }

    public String getSuggestedTestType() {
        return suggestedTestType;
    }

    public void setSuggestedTestType(String suggestedTestType) {
        this.suggestedTestType = suggestedTestType;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}
