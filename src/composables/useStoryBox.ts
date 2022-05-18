import { apolloClient, router } from '@/app'
import StoreFactory from '@/stores/StoreFactory'
import { UserStore } from '@/stores/UserStore'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { Entity } from 'coghent-vue-3-component-library'
import { useBoxVisiter } from 'coghent-vue-3-component-library'
import { RelationsAsEntitiesDocument } from 'coghent-vue-3-component-library'
import { boxVisiter, User, RelationType, UseBoxVisiter, Relation } from 'coghent-vue-3-component-library'
import { ref } from 'vue'

export const itemsInBasket = ref<number>(0)

const useStoryBox = (): {
  addAssetToVisiter: (_assetId: string) => void
  assetsInBasket: () => Promise<number>
  getAssetsFromBasket: () => Promise<Array<typeof Relation>>
  getRelationEntities: () => Promise<Array<typeof Entity>>
} => {
  const { boxVisiter, getByCode, addAssetToBoxVisiter, getRelationsByType }: typeof UseBoxVisiter = useBoxVisiter(apolloClient)

  const userStore = StoreFactory.get(UserStore)
  const user: typeof User = userStore.user

  getByCode('31099546')

  const assetsInBasket = async () => {
    let amount = 0
    if (boxVisiter.value != null) {
      const assets = await useBoxVisiter(apolloClient).getRelationsByType(boxVisiter.value.code, RelationType.InBasket) as Array<typeof Relation>
      amount = assets.length
    }
    itemsInBasket.value = amount
    console.log('itemsInBasket', itemsInBasket)
    return amount
  }

  const addAssetToVisiter = async (_assetId: string) => {
    console.log('boxvisiter', boxVisiter.value)
    if (user.name || boxVisiter.value != null) {
      console.log('Logged in user', user)
      const codeFromUser = boxVisiter.value.code//TODO:
      await useBoxVisiter(apolloClient).addAssetToBoxVisiter(codeFromUser, _assetId, RelationType.InBasket)
      assetsInBasket()
    }
    else {
      router.push({ path: '/login' })
    }
  }

  const getAssetsFromBasket = async () => {
    let assetRelations: Array<typeof Relation> = []
    if (boxVisiter.value != null) {
      assetRelations = await useBoxVisiter(apolloClient).getRelationsByType(boxVisiter.value.code, RelationType.InBasket) as Array<typeof Relation>
    }
    return assetRelations
  }

  const getRelationEntities = async () => {
    console.log({ apolloClient })
    let assets: Array<typeof Entity> = []
    const { fetchMore } = provideApolloClient(apolloClient)(() =>
      useQuery(RelationsAsEntitiesDocument, {
        id: '31099546',
      })
    );
    const response = await fetchMore({
      variables: { id: '31099546' },
    })?.catch(error => console.error(`Couldn't get the relation entities`, error))
    assets = response?.data.RelationsAsEntities
    return assets
  }



  return {
    addAssetToVisiter,
    assetsInBasket,
    getAssetsFromBasket,
    getRelationEntities,
  }

}

export default useStoryBox