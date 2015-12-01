//highstock K线图
var highStockChart = function(divID, result, crrentData) {
	var $reporting = $("#report");
	var firstTouch = true;
	// 开盘价^最高价^最低价^收盘价^成交量^成交额^涨跌幅^换手率^五日均线^十日均线^20日均线^30日均线^昨日收盘价 ^当前点离左边的相对距离
	var open, high, low, close, y, zde, zdf, hsl, MA5, MA10, MA20, MA30, zs, relativeWidth;
	// 定义数组
	var ohlcArray = [], volumeArray = [], MA5Array = [], MA10Array = [], MA20Array = [], MA30Array = [], zdfArray = [], zdeArray = [], hslArray = [], data = [], dailyData = [], data = [];
	/*
	 * 这个方法用来控制K线上的flags的显示情况，当afterSetExtremes时触发该方法,通过flags显示当前时间区间最高价和最低价
	 * minTime 当前k线图上最小的时间点 maxTime 当前k线图上最大的时间点 chart 当前的highstock对象
	 */
	var showTips = function(minTime, maxTime, chart) {
		chart.showLoading();
		// 定义当前时间区间中最低价的最小值，最高价的最大值 以及对应的时间
		var lowestPrice, highestPrice, array = [], highestArray = [], lowestArray = [], highestTime, lowestTime, flagsMaxData_1 = [], flagsMaxData_2 = [], flagsMinData_1, flagsMinData_2;
		for (var i = 0; i < ohlcArray.length - 1; i++) {
			if (ohlcArray[i][0] >= minTime && ohlcArray[i][0] <= maxTime) {
				array.push([ ohlcArray[i][0], ohlcArray[i][2], // 最高价
				ohlcArray[i][3] // 最低价
				])
			}
		}
		if (!array.length > 0) {
			return;
		}
		highestArray = array.sort(function(x, y) {
			return y[1] - x[1];
		})[0];// 根据最高价降序排列
		highestTime = highestArray[0];
		highestPrice = highestArray[1].toFixed(2);
		lowestArray = array.sort(function(x, y) {
			return x[2] - y[2];
		})[0]; // 根据最低价升序排列
		lowestTime = lowestArray[0];
		lowestPrice = lowestArray[2].toFixed(2);
		var formatDate1 = Highcharts.dateFormat('%Y-%m-%d', highestTime)
		var formatDate2 = Highcharts.dateFormat('%Y-%m-%d', lowestTime)
		flagsMaxData_1 = [ {
			x : highestTime,
			title : highestPrice + "(" + formatDate1 + ")"
		} ];

		flagsMaxData_2 = [ {
			x : highestTime,
			title : highestPrice
		} ];
		flagsMinData_1 = [ {
			x : lowestTime,
			title : lowestPrice + "(" + formatDate2 + ")"
		} ];

		flagsMinData_2 = [ {
			x : lowestTime,
			title : lowestPrice
		} ];
		var min = parseFloat(flagsMinData_2[0].title)
				- parseFloat(flagsMinData_2[0].title) * 0.1;
		var max = parseFloat(flagsMaxData_2[0].title)
				+ parseFloat(flagsMaxData_2[0].title) * 0.1;
		var tickInterval = ((max - min) / 5).toFixed(1) * 1;
		var oneMonth = 1000 * 3600 * 24 * 30;
		var oneYear = 1000 * 3600 * 24 * 365;
		var tickIntervalTime, dataFormat = '%Y-%m';
		if (maxTime - minTime > oneYear * 2) {
			tickIntervalTime = oneYear * 2
			dataFormat = '%Y';
		} else if (maxTime - minTime > oneYear) {
			tickIntervalTime = oneMonth * 6
		} else if (maxTime - minTime > oneMonth * 6) {
			tickIntervalTime = oneMonth * 3
		} else {
			tickIntervalTime = oneMonth
			dataFormat = '%m-%d'
		}

		// Y轴坐标自适应
		chart.yAxis[0].update({
			min : min,
			max : max,
			tickInterval : tickInterval
		});
		// X轴坐标自适应
		chart.xAxis[0].update({
			min : minTime,
			max : maxTime,
			tickInterval : tickIntervalTime,
			labels : {
				y : -78,// 调节y偏移
				formatter : function(e) {
					return Highcharts.dateFormat(dataFormat, this.value);
				}
			}
		});
		// 动态update flags(最高价)
		chart.series[5].update({
			data : flagsMaxData_2,
			point : {
				events : {
					click : function() {
						chart.series[5].update({
							data : flagsMaxData_1,
							width : 125
						});
						chart.series[6].update({
							data : flagsMinData_1,
							width : 125
						});
					}
				}
			},
			events : {
				mouseOut : function() {
					chart.series[5].update({
						data : flagsMaxData_2,
						width : 60
					});
					chart.series[6].update({
						data : flagsMinData_2,
						width : 60
					});
				}
			}
		});

		// 动态update flags(最低价)
		chart.series[6].update({
			data : flagsMinData_2,
			point : {
				events : {
					click : function() {
						chart.series[6].update({
							data : flagsMinData_1,
							width : 125
						});
						chart.series[5].update({
							data : flagsMaxData_1,
							width : 125
						});
					}
				}
			},
			events : {
				mouseOut : function() {
					chart.series[6].update({
						data : flagsMinData_2,
						width : 60
					});
					chart.series[5].update({
						data : flagsMaxData_2,
						width : 60
					});
				}
			}
		});
		chart.hideLoading();
	}

	// 修改colum条的颜色（重写了源码方法）
	var originalDrawPoints = Highcharts.seriesTypes.column.prototype.drawPoints;
	Highcharts.seriesTypes.column.prototype.drawPoints = function() {
		var merge = Highcharts.merge, series = this, chart = this.chart, points = series.points, i = points.length;

		while (i--) {
			var candlePoint = chart.series[0].points[i];
			if (candlePoint.open != undefined && candlePoint.close != undefined) { // 如果是K线图
																					// 改变矩形条颜色，否则不变
				var color = (candlePoint.open < candlePoint.close) ? '#DD2200'
						: '#33AA11';
				var seriesPointAttr = merge(series.pointAttr);
				seriesPointAttr[''].fill = color;
				seriesPointAttr.hover.fill = Highcharts.Color(color).brighten(
						0.3).get();
				seriesPointAttr.select.fill = color;
			} else {
				var seriesPointAttr = merge(series.pointAttr);
			}

			points[i].pointAttr = seriesPointAttr;
		}

		originalDrawPoints.call(this);
	}

	// 修改时间范围选择条重写了源码方法）
	/*
	 * otypeRender = Highcharts.RangeSelector.prototype.render;
	 * Highcharts.RangeSelector.prototype.render = function(min, max) {
	 * orgHighchartsRangeSelectorPrototypeRender.apply(this, [ min, max ]); var
	 * leftPosition = this.chart.plotLeft, topPosition = this.chart.plotTop + 5,
	 * space = 2; this.zoomText.attr({ x : leftPosition, y : topPosition + 15
	 * }); leftPosition += this.zoomText.getBBox().width; for (var i = 0; i <
	 * this.buttons.length; i++) { this.buttons[i].attr({ x : leftPosition, y :
	 * topPosition }); leftPosition += this.buttons[i].width + space; } };
	 */

	// 常量本地化
	Highcharts.setOptions({
		global : {
			useUTC : false
		},
		lang : {
			rangeSelectorFrom : "日期:",
			rangeSelectorTo : "至",
			rangeSelectorZoom : "数据显示日期范围",
			loading : '加载中...',
			shortMonths : [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
					'9月', '10月', '11月', '12月' ],
			weekdays : [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ],
		},
	});
	// 格式化数据，准备绘图
	dailyData = result.vl.split("~");
	for (i = 0; i < dailyData.length - 1; i++) {
		data[i] = dailyData[i].split("^");
	}
	// 把当前最新K线数据加载进来
	var length = data.length - 1;
	var crrentTime = crrentData[0];
	for (i = 0; i < data.length; i++) {
		// console.log( Highcharts.dateFormat('%A ,%Y-%m-%d
		// %H:%M',parseInt(data[i][0])));
		ohlcArray.push([ parseInt(data[i][0]), // the date
		parseFloat(data[i][1]), // open
		parseFloat(data[i][3]), // high
		parseFloat(data[i][4]), // low
		parseFloat(data[i][2]) // close
		]);

		if(data[i][11] > 0)
		{
			MA5Array.push([ parseInt(data[i][0]), // the date
			        		parseFloat(data[i][11])]);
		}
		if(data[i][12] > 0)
		{
			MA10Array.push([ parseInt(data[i][0]), parseFloat(data[i][12])]);
		}
		if(data[i][14] > 0)
		{
			MA30Array.push([ parseInt(data[i][0]), parseFloat(data[i][14])]);
		}
		volumeArray.push([ parseInt(data[i][0]), parseInt(data[i][5])]) // the date
	}

	// 开始绘图
	return new Highcharts.StockChart(
			{
				chart : {
					renderTo : divID,
					margin : [ 0, 5, 0, 5],
					plotBorderColor : '#3C94C4',
					plotBorderWidth : 0.3,
					events : {
						load : function() {
							var length = ohlcArray.length - 1;
							showTips(ohlcArray[0][0], ohlcArray[length][0],
									this);
						}
					}
				},
				loading : {
					labelStyle : {
						position : 'relative',
						top : '10em',
						zindex : 1000
					}
				},
				credits:{
					text:'@epianhong.com',               // 显示的文字
					href:'http://app.epianhong.com',   // 链接地址
					position:{                          // 位置设置
						align: 'left',
						x: 10,
						verticalAlign: 'bottom',
						y: -20
					},
					style: {                            // 样式设置
						cursor: 'pointer',
						fontSize: '10px'
					}
				},
				rangeSelector : {
					enabled:false,
				    selected: 4,
				    buttonTheme: {
				        visibility: 'hidden'
				    },
				    labelStyle: {
				        visibility: 'hidden'
				    },
					inputEnabled : false,
					inputDateFormat : '%Y-%m-%d' // 设置右上角的日期格式
				},
				plotOptions : {
					// 修改蜡烛颜色
					candlestick : {
						color : '#33AA11',
						upColor : '#DD2200',
						lineColor : '#33AA11',
						upLineColor : '#DD2200',
						maker : {
							states : {
								hover : {
									enabled : false,
								}
							}
						}
					},
					// 去掉曲线和蜡烛上的hover事件
					series : {
						states : {
							hover : {
								enabled : false
							}
						},
						line : {
							marker : {
								enabled : false
							}
						}
					}
				},
				// 格式化悬浮框
				tooltip : {
					formatter : function() {
						if (this.y == undefined) {
							return;
						}
						for (var i = 0; i < data.length; i++) {
							if (this.x == data[i][0]) {
								zdf = parseFloat(data[i][7]).toFixed(2);
								zde = parseFloat(data[i][8]).toFixed(2);
								hsl = parseFloat(data[i][9]).toFixed(2) + "%";
								zs = parseFloat(data[i][10]).toFixed(2);
							}
						}
						open = this.points[0].point.open.toFixed(2);
						high = this.points[0].point.high.toFixed(2);
						low = this.points[0].point.low.toFixed(2);
						
						close = this.points[0].point.close.toFixed(2);
						y = (this.points[1].point.y).toFixed(0);
						relativeWidth = this.points[0].point.shapeArgs.x;
						var stockName = this.points[0].series.name;
						var tip = '<b>'
								+ Highcharts.dateFormat('%Y-%m-%d  %A', this.x)
								+ '</b><br/>';
						if (open > zs) {
							tip += '开盘价：<span style="color: #DD2200;">' + open
									+ ' </span><br/>';
						} else {
							tip += '开盘价：<span style="color: #33AA11;">' + open
									+ ' </span><br/>';
						}
						if (high > zs) {
							tip += '最高价：<span style="color: #DD2200;">' + high
									+ ' </span><br/>';
						} else {
							tip += '最高价：<span style="color: #33AA11;">' + high
									+ ' </span><br/>';
						}
						if (low > zs) {
							tip += '最低价：<span style="color: #DD2200;">' + low
									+ ' </span><br/>';
						} else {
							tip += '最低价：<span style="color: #33AA11;">' + low
									+ ' </span><br/>';
						}
						if (close > zs) {
							tip += '收盘价：<span style="color: #DD2200;">' + close
									+ ' </span><br/>';
						} else {
							tip += '收盘价：<span style="color: #33AA11;">' + close
									+ ' </span><br/>';
						}
						if (zde > 0) {
							tip += '涨跌额：<span style="color: #DD2200;">' + zde
									+ ' </span><br/>';
						} else {
							tip += '涨跌额：<span style="color: #33AA11;">' + zde
									+ ' </span><br/>';
						}
						if (zdf > 0) {
							tip += '涨跌幅：<span style="color: #DD2200;">' + zdf
									+ '%</span><br/>';
						} else {
							tip += '涨跌幅：<span style="color: #33AA11;">' + zdf
									+ '%</span><br/>';
						}
						if(this.points[2] != undefined)
						{
							tip += "MA5:" + this.points[2].y.toFixed(2) + "<br/>";
						}
						if(this.points[3] != undefined)
						{
							tip += "MA10:" + this.points[3].y.toFixed(2) + "<br/>";
						}
						if(this.points[4] != undefined)
						{
							tip += "MA30:" + this.points[4].y.toFixed(2) + "<br/>";
						}
						tip += "换手率：" + hsl + "<br/>";
						tip += "成交量：" + y + "<br/>";
						return tip;
					},
					// crosshairs: [true, true]//双线
					crosshairs : {
						dashStyle : 'dash'
					},
					borderColor : 'white',
					positioner : function() { // 设置tips显示的相对位置
						var halfWidth = this.chart.chartWidth / 2;// chart宽度
						var width = this.chart.chartWidth - 155;
						var height = this.chart.chartHeight / 5 - 8;// chart高度
						if (relativeWidth < halfWidth) {
							return {
								x : width,
								y : height
							};
						} else {
							return {
								x : 5,
								y : height
							};
						}
					},
					shadow : false
				},
				title : {
					enabled : false
				},
				exporting : {
					enabled : false
				// 设置导出按钮不可用
				},
				scrollbar : {
					barBackgroundColor : 'gray',
					barBorderRadius : 7,
					barBorderWidth : 0,
					buttonBackgroundColor : 'gray',
					buttonBorderWidth : 0,
					buttonArrowColor : 'yellow',
					buttonBorderRadius : 7,
					rifleColor : 'yellow',
					trackBackgroundColor : 'white',
					trackBorderWidth : 1,
					trackBorderColor : 'silver',
					trackBorderRadius : 7,
					// enabled: false,
					liveRedraw : false
				// 设置scrollbar在移动过程中，chart不会重绘
				},
				navigator : {
					adaptToUpdatedData : false,
					xAxis : {
						labels : {
							formatter : function(e) {
								return Highcharts.dateFormat('%m-%d',
										this.value);
							}
						}
					},
					handles : {
						backgroundColor : '#808080',
					// borderColor: '#268FC9'
					},
					//margin : -10
				},
				xAxis : {
					type : 'datetime',
					tickLength : 0,// X轴下标长度
				// minRange: 3600 * 1000*24*30, // one month
			
				  events: { 
					  afterSetExtremes: function(e) { 
						  var minTime =Highcharts.dateFormat("%Y-%m-%d", e.min); 
						  var maxTime =Highcharts.dateFormat("%Y-%m-%d", e.max); 
						  var chart =this.chart; 
						  showTips(e.min,e.max,chart); 
						  } 
				  	},
				  	//offset: -30,
				},
				yAxis : [ {
					labels: {
	                    align: 'right',
	                    x: -3,
	                    formatter: function () {
	                    	if(this.value < 100)
	                    	{
	                    		return this.value.toFixed(2);
	                    	}
	                        return this.value.toFixed(0);
	                    },
	                    color : '#eeeeee'
	                },
					title : {
						enable : false
					},
					height : '70%',
					lineWidth : 1,// Y轴边缘线条粗细
					gridLineColor : '#346691',
					gridLineWidth : 0.1,
					// gridLineDashStyle: 'longdash',
					opposite : true
				}, {
					title : {
						enable : false
					},
					top : '80%',
					height : '20%',
					labels : {
						align: 'right',
						x : -15
					},
					gridLineColor : '#346691',
					gridLineWidth : 0.1,
					lineWidth : 1,
				} ],
				series : [ {
					type : 'candlestick',
					id : "candlestick",
					name : result.cname,
					data : ohlcArray,
					dataGrouping : {
						enabled : false
					}
				}, {
					type : 'column',// 2
					name : '成交量',
					data : volumeArray,
					yAxis : 1,
					dataGrouping : {
						enabled : false
					}
				}, {
					type : 'spline',
					name : 'MA5',
					color : '#1aadce',
					data : MA5Array,
					lineWidth : 1,
					dataGrouping : {
						enabled : false
					}
				}, {
					type : 'spline',
					name : 'MA10',
					data : MA10Array,
					color : '#8bbc21',
					threshold : null,
					lineWidth : 1,
					dataGrouping : {
						enabled : false
					}
				}, {
					type : 'spline',
					name : 'MA30',
					data : MA30Array,
					color : '#910000',
					threshold : null,
					lineWidth : 1,
					dataGrouping : {
						enabled : false
					}
				}, {
					type : 'flags',
					cursor : 'pointer',
					style : {
						fontSize : '8px',
						fontWeight : 'normal',
						textAlign : 'center',
						x : -15
					},
					lineWidth : 0.5,
					onSeries : 'candlestick',
					width : 60,
					shape : 'squarepin',
					color: '#333333',
				}, {
					type : 'flags',
					cursor : 'pointer',
					style : {
						fontSize : '8px',
						fontWeight : 'normal',
						textAlign : 'center',
						x : -15
					},
					lineWidth : 0.5,
					onSeries : 'candlestick',
					width : 60,
					shape : 'squarepin',
					color: '#333333',
				} ]
			});
}