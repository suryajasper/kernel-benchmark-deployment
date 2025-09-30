import type {
  RepoPullRequest,
  BenchmarkRun,
  PerformanceRun,
  KernelConfig,
  TuningResults,
} from "../types";

export async function fetchModifications() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/pull_requests`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const modifications: RepoPullRequest[] = [];

    for (let obj of data) {
      obj["timestamp"] = new Date(obj["timestamp"]);
      modifications.push(obj as RepoPullRequest);
    }

    modifications.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    console.log("modifications", modifications);

    return modifications;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error}`);
  }
}

export async function fetchRuns() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/runs`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jobs: BenchmarkRun[] = await response.json();
    return jobs;
  } catch (error) {
    throw new Error(`Failed to fetch runs: ${error}`);
  }
}

export async function fetchPerformanceRuns() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/performances`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const perfs: PerformanceRun[] = await response.json();
    return perfs;
  } catch (error) {
    throw new Error(`Failed to fetch runs: ${error}`);
  }
}

export async function fetchKernels() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/kernels`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const kernelConfigs: KernelConfig[] = await response.json();
  return kernelConfigs;
}

export async function fetchTuningResults() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/tune/results`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const tuningConfigs: TuningResults = await response.json();
  return tuningConfigs;
}

export async function rebase() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/rebase`,
    {
      method: "POST",
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  const modifications = data["modifications"] as RepoPullRequest[];
  const performances = data["performances"] as PerformanceRun[];
  return { modifications, performances };
}

export async function triggerWorkflow(pullRequest: RepoPullRequest) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/workflow/trigger`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pullRequest),
    }
  );
  if (!response.ok) {
    console.log(response.statusText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function cancelWorkflow(runId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/workflow/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ runId }),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function triggerTuningWorkflow(kernelIds: string[]) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URL}/tune`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kernel_ids: kernelIds }),
    }
  );
  if (!response.ok) {
    console.log(response.statusText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}
