import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const toastSuccessOpt = {
  position: "top-center",
  autoClose: 1500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  style: { backgroundColor: "#08313A" },
};
const toastErrorOpt = {
  position: "top-center",
  autoClose: 1500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  style: { backgroundColor: "#4d0000" },
};

const taskApi = axios.create({
  baseURL: "http://localhost:5000/api/tasks",
});

// get tasks by studentId
const getTasksByUser = async (id) => {
  const result = await taskApi.get(`/${id}`);
  return result.data;
};
export const useTasksByUser = (id) => {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async ({ signal }) => getTasksByUser(id, { signal }),
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// post task
const addTask = async (newTask) => {
  const result = await taskApi.post("/", {
    ...newTask,
  });
  return result.data;
};
export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask) => addTask(newTask),
    onSuccess: ({ message }) => {
      toast.success(message, toastSuccessOpt);
    },
    onError: (err) => {
      let errMsg;
      if (err.response) {
        errMsg = err.response.data.message;
      } else if (err.request) {
        errMsg = err.request.message;
      } else {
        errMsg = err.message;
      }
      toast.error(errMsg, toastErrorOpt);
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });
};

// PATCH Task
const updateTask = async ({ id, ...data }) => {
  const result = await taskApi.patch("/", { taskId: id, ...data });
  return result.data;
};
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task) => updateTask(task),
    onMutate: async (task) => {
      await queryClient.cancelQueries({
        queryKey: [`tasks`],
      });
      const previousTaskslist = queryClient.getQueryData([`tasks`]);
      queryClient.setQueryData([`tasks`], (old) => {
        if (old) {
          return [...old.filter((t) => t._id !== task.id), task];
        } else {
          return [task];
        }
      });
      return { previousTaskslist };
    },
    onSuccess: ({ message }) => {
      toast.success(message, toastSuccessOpt);
    },
    onError: (err, context) => {
      queryClient.setQueryData([`tasks`], context.previousTaskslist);
      toast.error(err.message, toastErrorOpt);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [`tasks`],
      });
    },
  });
};

// DELETE Application
const deleteTask = async (id) => {
  const result = await taskApi.delete("/", { data: { id: id } });
  return result.data;
};
export const useRemoveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: ({ message }) => {
      toast.success(message, toastSuccessOpt);
    },
    onError: (err) => {
      toast.error(err.message, toastErrorOpt);
    },
    onSettled: () => {
      queryClient.resetQueries({
        queryKey: ["tasks"],
      });
    },
  });
};