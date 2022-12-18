import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosApi as usersApi } from "./axios";
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

// get users by their role
const getUsersByRole = async (role) => {
  const result = await usersApi.get(`/users/role/${role}`);
  return result.data;
};
export const useUsersByRole = (role) => {
  return useQuery({
    queryKey: [`users-${role}`],
    queryFn: async ({ signal }) => getUsersByRole(role, { signal }),
    initialData: [],
    retry: 1,
  });
};

// get user by id
const getUserById = async (id) => {
  const result = await usersApi.get(`/users/${id}`);
  return result.data;
};
export const useUserById = (id) => {
  return useQuery({
    queryKey: [`userID-${id}`],
    queryFn: getUserById.bind(null, id),
    initialData: {},
    refetchOnWindowFocus: false,
  });
};

// post user and optimistic update
const addEmployee = async (newUser) => {
  const result = await usersApi.post("/users/", {
    ...newUser,
  });
  return result.data;
};
export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newUser) => addEmployee(newUser),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ["users-employee"] });

      const previousEmployeelist = queryClient.getQueryData(["users-employee"]);

      queryClient.setQueryData(["users-employee"], (old) => {
        if (old) {
          return [...old, newUser];
        }
        return [newUser];
      });

      return { previousEmployeelist };
    },
    onSuccess: (response) => {
      toast.success(response.message, toastSuccessOpt);
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(
        ["users-employee"],
        context.previousEmployeelist
      );
      let errMsg;
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errMsg = err.response.data.message;
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js

        errMsg = err.request.message;
      } else {
        // Something happened in setting up the request that triggered an Error
        errMsg = err.message;
      }
      toast.error(errMsg, toastErrorOpt);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users-employee"] });
    },
  });
};

// PATCH USER
const updateEmployee = async (updatedUser) => {
  const result = await usersApi.patch("/users", {
    ...updatedUser,
  });
  return result.data;
};
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user) => updateEmployee(user),
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: ["users-employee"] });
      const previousUserslist = queryClient.getQueryData(["users-employee"]);
      queryClient.setQueryData(["users-employee"], (old) => {
        if (old) {
          return [...old, user];
        } else {
          return [user];
        }
      });
      return { previousUserslist };
    },
    onSuccess: ({ message }) => {
      toast.success(message, toastSuccessOpt);
    },
    onError: (err, user, context) => {
      queryClient.setQueryData(["users-employee"], context.previousUserslist);
      toast.error(err.message, toastErrorOpt);
    },
    onSettled: ({ id }) => {
      console.log(id);
      queryClient.invalidateQueries({
        queryKey: ["users-employee"],
      });
      queryClient.invalidateQueries({
        queryKey: [`userID-${id}`],
      });
    },
  });
};

// DELETE USER
const deleteUser = async (id, role) => {
  const result = await usersApi.delete("/users", {
    data: { id: id, role: role },
  });
  return result.data;
};
export const useRemoveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => deleteUser(id, role),
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
    onSettled: ({ id, role }) => {
      queryClient.invalidateQueries({
        queryKey: [`users-${role}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`userID-${id}`],
      });
    },
  });
};
// Assign USERs
const assignUsers = async (stdId, consultIds) => {
  const result = await usersApi.patch("/users/assign", { stdId, consultIds });
  return result.data;
};
export const useAssignUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stdId, consultIds }) => {
      return assignUsers(stdId, consultIds);
    },
    onError: (err) => {
      toast.error(err.message, toastErrorOpt);
    },
    onSettled: ({ stdId }) => {
      queryClient.resetQueries({ queryKey: [`userID-${stdId}`] });
    },
  });
};
// Deassign USERs
const deAssignUsers = async (stdId, consultId) => {
  const result = await usersApi.patch("/users/deassign", { stdId, consultId });
  return result.data;
};
export const useDeAssignUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stdId, consultId }) => deAssignUsers(stdId, consultId),
    onError: (err) => {
      toast.error(err.message, toastErrorOpt);
    },
    onSettled: ({ stdId }) => {
      queryClient.invalidateQueries({ queryKey: [`userID-${stdId}`] });
    },
  });
};
