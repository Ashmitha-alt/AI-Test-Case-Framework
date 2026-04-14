package com.example.tms.model;

public class SuggestionResponse {

    private String suggestedTitle;
    private String suggestedPriority;
    private String suggestedTestType;

    public SuggestionResponse(String title, String priority, String type) {
        this.suggestedTitle = title;
        this.suggestedPriority = priority;
        this.suggestedTestType = type;
    }

    public String getSuggestedTitle() {
        return suggestedTitle;
    }

    public String getSuggestedPriority() {
        return suggestedPriority;
    }

    public String getSuggestedTestType() {
        return suggestedTestType;
    }
}
