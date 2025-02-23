export const formatNumber = (n) => {
    if (n < 1000) {
        return n.toString();
    }
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
}