const express = require('express');
const app = express();
const Service = require('./Service');
const StockModel = require('../models/StockModel');
const { Sequelize } = require('sequelize'); // Add this import

app.post('/stock/save', Service.isLogin, async (req, res) => {
    try {
        let payload = {
            qty: req.body.qty,
            productId: req.body.productId,
            userId: Service.getMemberId(req)
        }

        await StockModel.create(payload);

        res.send({ message: 'success' });
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})

app.get('/stock/list', Service.isLogin, async (req, res) => {
    try {
        const ProductModel = require('../models/ProductModel');
        StockModel.belongsTo(ProductModel);

        const results = await StockModel.findAll({
            where: {
                userId: Service.getMemberId(req)
            },
            order: [['id', 'DESC']],
            include: {
                model: ProductModel
            }
        })

        res.send({ message: 'success', results: results });
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})

app.delete('/stock/delete/:id', Service.isLogin, async (req, res) => {
    try {
        await StockModel.destroy({
            where: {
                userId: Service.getMemberId(req),
                id: req.params.id
            }
        })

        res.send({ message: 'success' });
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})

app.get('/stock/report', Service.isLogin, async (req, res) => {
    try {
        const ProductModel = require('../models/ProductModel');
        const BillSaleDetailModel = require('../models/BillSaleDetailModel');

        ProductModel.hasMany(StockModel);
        ProductModel.hasMany(BillSaleDetailModel);

        StockModel.belongsTo(ProductModel);
        BillSaleDetailModel.belongsTo(ProductModel)

        let arr = [];

        const results = await ProductModel.findAll({
            include: [
                {
                    model: StockModel,
                    include: {
                        model: ProductModel
                    }
                },
                {
                    model: BillSaleDetailModel,
                    include: {
                        model: ProductModel
                    }
                }
            ],
            where: {
                userId: Service.getMemberId(req)
            }
        })

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const stocks = result.stocks;
            const billSaleDetails = result.billSaleDetails;

            let stockIn = 0;
            let stockOut = 0;

            for (let j = 0; j < stocks.length; j++) {
                const item = stocks[j];
                stockIn += parseInt(item.qty);
            }

            for (let j = 0; j < billSaleDetails.length; j++) {
                const item = billSaleDetails[j];
                stockOut += parseInt(item.qty);
            }

            arr.push({
                result: result,
                stockIn: stockIn,
                stockOut: stockOut
            })
        }

        res.send({ message: 'success', results: arr });
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})

app.get('/stock/combinedReport', Service.isLogin, async (req, res) => {
    try {
        const ProductModel = require('../models/ProductModel');
        const BillSaleDetailModel = require('../models/BillSaleDetailModel');
        const sequelize = StockModel.sequelize; // Get sequelize instance from model

        // Get all stock entries
        const stockResults = await StockModel.findAll({
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('qty')), 'stockQty']
            ],
            where: {
                userId: Service.getMemberId(req)
            },
            group: ['productId', 'product.id', 'product.name', 'product.barcode', 'product.price', 'product.cost'], // Include all selected fields
            include: {
                model: ProductModel,
                attributes: ['name', 'barcode', 'price', 'cost']
            }
        });

        // Get all sales
        const salesResults = await BillSaleDetailModel.findAll({
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('qty')), 'soldQty']
            ],
            where: {
                userId: Service.getMemberId(req)
            },
            group: ['productId']
        });

        // Combine the results
        const combinedResults = stockResults.map(stock => {
            const sales = salesResults.find(sale => sale.productId === stock.productId);
            const stockQty = parseInt(stock.get('stockQty')) || 0;
            const soldQty = sales ? parseInt(sales.get('soldQty')) || 0 : 0;
            const remainingQty = Math.max(0, stockQty - soldQty);

            return {
                productId: stock.productId,
                name: stock.product.name,
                barcode: stock.product.barcode,
                price: stock.product.price,
                cost: stock.product.cost,
                stockQty: stockQty,
                soldQty: soldQty,
                remainingQty: remainingQty
            };
        });

        res.send({ message: 'success', results: combinedResults });
    } catch (e) {
        console.error('Error in combinedReport:', e); // Add better error logging
        res.status(500).send({ message: e.message });
    }
});

module.exports = app;