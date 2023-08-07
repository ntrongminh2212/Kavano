// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract KavanoOrders {
    struct Order {
        string order_id;
        address customerAddress;
        uint256 totalCostUSD;
        uint256 totalCostETH;
    }
    string[] lstOrderId;
    mapping(string => Order) public orderById;
    address public immutable owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeed) {
        owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "sender is not owner");
        _;
    }

    //Khai báo sự kiện
    event FundEvent(string order_id, uint256 totalCostETH);
    event CreateOrderEvent(string order_id);
    event WithdrawEvent(uint256 remainBalance);
    event RepayEvent(uint256 remainBalance);

    function createOrder(
        string memory _order_id,
        uint256 _totalCostUSD
    ) public onlyOwner {
        orderById[_order_id] = Order(_order_id, address(0), _totalCostUSD, 0);
        lstOrderId.push(_order_id);
        emit CreateOrderEvent(_order_id);
    }

    function deleteOrder(string memory _order_id) public onlyOwner {
        delete orderById[_order_id];
        deleteOrderId(_order_id);
    }

    function retrieveTotalCost(
        string memory _order_id
    ) public view returns (uint256) {
        return orderById[_order_id].totalCostUSD;
    }

    function fund(string memory _order_id) public payable {
        //Kiểm tra đơn hàng tồn tại không?
        require(
            orderById[_order_id].totalCostUSD > 0,
            "Don hang khong ton tai"
        );

        //Kiểm tra khách trả tiền chưa?
        if (orderById[_order_id].customerAddress == address(0)) {
            //Kiểm tra khách trả đủ tiền không?
            require(
                PriceConverter.getConversionRate(msg.value, s_priceFeed) >=
                    orderById[_order_id].totalCostUSD,
                "Chua tra du tien"
            );

            orderById[_order_id].customerAddress = msg.sender;
            orderById[_order_id].totalCostETH = msg.value;

            emit FundEvent(_order_id, msg.value);
        } else {}
    }

    function withdraw(string memory _order_id) public onlyOwner {
        (bool callSuccess, ) = payable(msg.sender).call{
            value: orderById[_order_id].totalCostETH
        }("");
        require(callSuccess, "Call failed");
        delete orderById[_order_id];
        deleteOrderId(_order_id);
        emit WithdrawEvent(address(this).balance);
    }

    function repay(string memory _order_id) public onlyOwner {
        (bool callSuccess, ) = payable(orderById[_order_id].customerAddress)
            .call{value: orderById[_order_id].totalCostETH}("");
        require(callSuccess, "Call failed");
        delete orderById[_order_id];
        deleteOrderId(_order_id);
        emit RepayEvent(address(this).balance);
    }

    function viewAllOrder() public view returns (Order[] memory) {
        Order[] memory allOrder = new Order[](lstOrderId.length);
        for (uint i = 0; i < lstOrderId.length; i++) {
            allOrder[i] = orderById[lstOrderId[i]];
        }
        return allOrder;
    }

    function viewBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deleteOrderId(string memory orderId) public {
        for (uint i = 0; i < lstOrderId.length; i++) {
            if (keccak256(bytes(lstOrderId[i])) == keccak256(bytes(orderId))) {
                lstOrderId[i] = lstOrderId[lstOrderId.length - 1];
                lstOrderId.pop();
                break;
            }
        }
    }

    function USDtoWEI(uint256 _usd) public view returns (uint256) {
        uint256 ethPrice = PriceConverter.getPrice(s_priceFeed);
        return (_usd * 1e18) / ethPrice;
    }

    function getPriceETH() public view returns (uint256) {
        return PriceConverter.getPrice(s_priceFeed);
    }
}
