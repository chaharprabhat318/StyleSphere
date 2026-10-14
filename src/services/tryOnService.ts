
export interface TryOnRequest {
  userPhotoUrl: string;
  garmentId: string;
  garmentImageUrl: string;
  category: string;
}

export interface TryOnResult {
  status: 'success' | 'failed' | 'fallback_demo';
  resultImageUrl: string;
  confidenceScore: number;
  engineUsed: string;
  notes: string;
}

class TryOnService {
  async processTryOn(request: TryOnRequest): Promise<TryOnResult> {
    // If real backend route is provided by Member 2/3:
    if (import.meta.env.VITE_USE_REAL_BACKEND === 'true') {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/try-on`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Real Try-On service unreachable, falling back to honest demo fallback', err);
      }
    }

    // Realistic demonstration latency simulation (2.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Return honest fallback simulation
    return {
      status: 'fallback_demo',
      resultImageUrl: request.userPhotoUrl, // or high-res rendered fit photo
      confidenceScore: 92,
      engineUsed: 'Diffusion-VTON Pipeline (Simulated / Local Fallback)',
      notes: 'This preview demonstrates the fitting architecture. In production, this routes to Member 2\'s open-source IDM-VTON / HuggingFace diffusion model.',
    };
  }
}

export const tryOnService = new TryOnService();
