import CategoryForm from '../../../../../components/CategoryForm';

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  return <CategoryForm id={id} />;
}
