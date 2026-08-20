import api from "@/services/api";
import type { ContactRequest, ContactResponse } from "@/types/contact";

export const contactApi = {
  submit: (data: ContactRequest) => api.post<ContactResponse>("/contact", data),
};
