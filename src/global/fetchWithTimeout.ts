const globalFunction = {
  async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number
  ) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      throw error.name === "AbortError"
        ? new Error("Request timed out")
        : error;
    }
  },
};

export { globalFunction };
