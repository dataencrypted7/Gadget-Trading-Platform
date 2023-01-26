const express = require('express')
const siterouter=express.Router();

siterouter.get('/about', (req, res) => {
    // res.send('About page');
    res.render('./OtherPages/about');
 });
 
 siterouter.get('/contact', (req, res) => {
     res.render('./OtherPages/contact');
 });
 
 siterouter.get('/contact-me', (req, res) => {
     res.redirect(301, '/contact');
 });
 module.exports = siterouter;