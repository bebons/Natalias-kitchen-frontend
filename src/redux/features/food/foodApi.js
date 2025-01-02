import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "@/utils/baseURL";
const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/food`,
  credentials: "include",
  prepareHeaders: (Headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      Headers.set("Authorization", `Bearer ${token}`);
    }
    return Headers;
  },
});

const foodApi = createApi({
  reducerPath: "foodApi",
  tagTypes: ["Food"],
  baseQuery,
  endpoints: (builder) => ({
    fetchAllFood: builder.query({
      query: () => "/",
      providesTags: ["Food"],
    }),
    fetchFoodById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (results, error, id) => [{ type: "Food", id }],
    }),
    addFood: builder.mutation({
      query: (newFood) => ({
        url: "/add-food",
        method: "POST",
        body: newFood,
      }),
      invalidatesTags: ["Food"],
    }),
    updateFood: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/edit/${id}`,
        method: "PUT",
        body: rest,
        headers: {
          "Content-type": "application/json",
        },
      }),
      invalidatesTags: ["Food"],
    }),
    deleteFood: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Food"],
    }),
  }),
});
export const {
  useFetchAllFoodQuery,
  useFetchFoodByIdQuery,
  useAddFoodMutation,
  useDeleteFoodMutation,
  useUpdateFoodMutation,
} = foodApi;
export default foodApi;
