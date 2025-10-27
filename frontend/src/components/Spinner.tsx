import { ClipLoader } from 'react-spinners';

type Props = {
    isLoading?: boolean;
    size?: number;
    color?: string;
}

const spinner = ({isLoading = true, size = 30, color = '#57e5f5'}: Props) => {
    if (!isLoading) return null;
  return (
    <ClipLoader
        color={color}
        loading={isLoading}
        size={size}
        data-testid="loader"
    />
  )
}

export default spinner