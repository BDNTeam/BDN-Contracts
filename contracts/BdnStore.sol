pragma solidity ^0.4.18;

contract BDNStore {

	uint public dataIndex;
	mapping (address => mapping(uint => Data)) stores;
	mapping (uint => address) dataIdInStore;

	struct Data {
		uint id;
		uint uuid;
		address ueid;
		string dataType;
		string filePath;
		uint totlaCount;
		uint createTime;
	}

	function BDNStore() public {
		dataIndex = 0;
	}

	function addDataToStore(uint _uuid, address _ueid, string _dataType, string _filePath, uint _totalCount,uint _createTime) public {
		dataIndex += 1;
		Data memory data = Data(dataIndex, _uuid, _ueid, _dataType, _filePath, _totalCount, _createTime);
		stores[_ueid][dataIndex] = data;
		dataIdInStore[dataIndex] = _ueid;
	}

	function getData(uint _dataId) view public returns (uint,uint,address,string,string,uint,uint) {
		Data memory data = stores[dataIdInStore[_dataId]][_dataId];
		return (data.id, data.uuid, data.ueid, data.dataType, data.filePath, data.totlaCount, data.createTime);
	}

}
