import { API_BASE } from "../config/api";

export const fetchModels = async () => {
    const response = await fetch(`${API_BASE}/models/get/db_list`);
    if (!response.ok) {
        throw new Error("Failed to fetch models");
    }
    return response.json();
};

export const fetchModel = async (modelName) => {
    const response = await fetch(`${API_BASE}/models/get/db_show?model_name=${modelName}`);
    if (!response.ok) {
        throw new Error("Failed to fetch model");
    }
    return response.json();
};