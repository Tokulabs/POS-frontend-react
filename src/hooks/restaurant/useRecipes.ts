import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantRecipesURL } from '@/utils/network'
import { IRecipe, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'

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

export const useRecipes = (recipeId?: number, menuItemId?: number) => {
  const queryClient = useQueryClient()

  const { isLoading, data: recipe } = useQuery({
    queryKey: ['restaurant-recipe', recipeId],
    queryFn: () => getRecipe(recipeId!),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const setRecipeInCaches = (updatedRecipe: IRecipe) => {
    // Update standalone recipe cache if it was queried directly
    queryClient.setQueryData(['restaurant-recipe', updatedRecipe.id], updatedRecipe)
    // Update recipe embedded in the menu item detail
    if (menuItemId) {
      queryClient.setQueryData<IRestaurantProductDetail>(
        ['restaurant-menu-item', menuItemId],
        (prev) => prev ? { ...prev, recipe: updatedRecipe } : prev,
      )
    }
  }

  const createRecipe = useMutation({
    mutationFn: (payload: RecipePayload) =>
      axiosRequest<IRecipe>({ url: restaurantRecipesURL, method: 'post', payload, hasAuth: true }),
    onSuccess: (response) => {
      if (response?.data) setRecipeInCaches(response.data)
    },
  })

  const updateRecipe = useMutation({
    mutationFn: ({ id, ...payload }: RecipeUpdatePayload & { id: number }) =>
      axiosRequest<IRecipe>({ url: `${restaurantRecipesURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: (response) => {
      if (response?.data) setRecipeInCaches(response.data)
    },
  })

  return {
    isLoading,
    recipe,
    createRecipe,
    updateRecipe,
  }
}
