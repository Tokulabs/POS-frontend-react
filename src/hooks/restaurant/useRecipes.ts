import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantRecipesURL } from '@/utils/network'
import { IRecipe } from '@/pages/Restaurant/types/RestaurantTypes'

type RecipeIngredientPayload = {
  ingredient: number
  quantity: number
  unit: number
}

type RecipePayload = {
  product_detail: number
  notes: string
  recipe_ingredients: RecipeIngredientPayload[]
}

type RecipeUpdatePayload = {
  notes: string
  recipe_ingredients: RecipeIngredientPayload[]
}

const getRecipe = async (id: number): Promise<IRecipe> => {
  const response = await axiosRequest<IRecipe>({
    url: `${restaurantRecipesURL}${id}/`,
    hasAuth: true,
  })
  return response?.data as IRecipe
}

export const useRecipes = (recipeId?: number) => {
  const queryClient = useQueryClient()

  const { isLoading, data: recipe } = useQuery({
    queryKey: ['restaurant-recipe', recipeId],
    queryFn: () => getRecipe(recipeId!),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const createRecipe = useMutation({
    mutationFn: (payload: RecipePayload) =>
      axiosRequest({ url: restaurantRecipesURL, method: 'post', payload, hasAuth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-recipe'] })
    },
  })

  const updateRecipe = useMutation({
    mutationFn: ({ id, ...payload }: RecipeUpdatePayload & { id: number }) =>
      axiosRequest({ url: `${restaurantRecipesURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-recipe'] })
    },
  })

  return {
    isLoading,
    recipe,
    createRecipe,
    updateRecipe,
  }
}
