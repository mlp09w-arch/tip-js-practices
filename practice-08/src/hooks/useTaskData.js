import { useEffect, useRef, useState } from "react";

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const activeRead = useRef(null);
  const activeMutation = useRef(null);
  const { q, completed, priority, categoryId } = filters;

  useEffect(() => () => {
    activeMutation.current?.abort();
    activeMutation.current = null;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRead.current = controller;
    const { signal } = controller;
    setStatus("loading");
    setError(null);

    async function load() {
      try {
        const data = await api.loadInitialData({ q, completed, priority, categoryId }, { signal });
        if (signal.aborted) return;
        setSnapshot(data);
        setStatus("ready");
      } catch (failure) {
        if (signal.aborted || failure?.kind === "aborted") return;
        setError(failure);
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [api, q, completed, priority, categoryId, revision]);

  function refresh() {
    activeRead.current?.abort();
    setStatus("loading");
    setError(null);
    setRevision((value) => value + 1);
  }

  async function mutate(operation) {
    if (activeMutation.current) return false;
    const controller = new AbortController();
    activeMutation.current = controller;
    setPending(true);
    setMutationError(null);
    try {
      await operation({ signal: controller.signal });
      if (controller.signal.aborted) return false;
      refresh();
      return true;
    } catch (failure) {
      if (!controller.signal.aborted && failure?.kind !== "aborted") setMutationError(failure);
      return false;
    } finally {
      if (activeMutation.current === controller) {
        activeMutation.current = null;
        setPending(false);
      }
    }
  }

  return {
    snapshot, status, error, mutationError, pending, refresh,
    saveTask: (id, value) => mutate((options) => id === null
      ? api.createTask(value, options)
      : api.updateTask(id, value, options)),
    toggleTask: (task) => mutate((options) => api.setTaskCompleted(task.id, !task.completed, options)),
    deleteTask: (id) => mutate((options) => api.deleteTask(id, options)),
    resetData: () => mutate((options) => api.resetDemoData(options)),
  };
}
