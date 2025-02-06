export const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatPhoneNumber = (phoneNumber: string): string => {
    return phoneNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4");
};

export function validateEmptySpaces(input: string): boolean {
    return input.trim().length > 0;
  }

export async function fetchWithExponentialBackoff(
    url: string,
    options: RequestInit = {},
    maxAttempts: number = 5,
    baseDelayMs: number = 100
): Promise<Response> {
    let attempt = 0;
    while (attempt < maxAttempts) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            attempt++;
            if (attempt >= maxAttempts) {
                throw new Error(`Failed after ${maxAttempts} attempts: ${error}`);
            }
            const delayMs = baseDelayMs * Math.pow(2, attempt);
            console.log(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("Unexpected error");
}
