
const postDistributor = distributor => {
    console.log(distributor);
    const isDistributorValid = validateNewDistributor(distributor);
    if (!distributor || !isDistributorValid) return false;

}

const getDistributors = () => {

}

module.exports = {postDistributor, getDistributors};