import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { range } from 'lodash';
import { getYear } from 'date-fns';
import { getMonth } from 'date-fns';
import { PieChart } from '@mui/x-charts/PieChart';

import './App.css';
import Book from './components/Book.js'

import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import "react-datepicker/dist/react-datepicker.css";



function App() {
  
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mnDate, setMinDate] = useState(new Date());
  const [mxDate, setMaxDate] = useState(new Date());
  const [books, setBooks] = useState([]);

  const API_KEY = process.env.REACT_APP_API_KEY;

  const years = range(2008, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const retrieveAPIData = async function() {
    const url = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const allData = await response.json();
      setData(allData.results.map((item, index) => (
        {
          key               : index,
          category          : item.list_name,
          encoded_category  : item.list_name_encoded, 
          startDate         : item.oldest_published_date,
          endDate           : item.newest_published_date,
          frequency         : item.updated
        }
        ))
      );
    } catch (error) {
      console.error(`API Retrieval Error: "${error}`)
    }
  };
  
  useEffect( () => {
    retrieveAPIData();
  }, []);
  
  useEffect( () => {
    const getDateLimits = (min) => {
      if (!selectedCategory) return new Date();
      let obj = data.find(item => item.key === selectedCategory.value);
      if (!obj) return new Date();
      return min ? new Date(obj.startDate) : new Date(obj.endDate);
    }
    if (selectedCategory) {
      setMinDate(getDateLimits(true));
      setMaxDate(getDateLimits(false));
      setSelectedDate(getDateLimits(false));
    }
  }, [selectedCategory]);

  const findBestsellers =  async function () {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const encoded_category = data.find(item => item.key === selectedCategory.value).encoded_category;

    const URL = `https://api.nytimes.com/svc/books/v3/lists/${formattedDate}/${encoded_category}.json?api-key=${API_KEY}`;

    const response = await fetch(URL);
    const allData = await response.json();

    setBooks(allData.results.books);
  }

  const getFrequencies = () => {
    const f = data[0].frequency === "WEEKLY" ? "Weeks" : "Months";
    let freqs = [
      {id: 0, value: 0, label: `0 ${f}`},
      {id: 1, value: 0, label: `1-5 ${f}`},
      {id: 2, value: 0, label: `6-11 ${f}`},
      {id: 3, value: 0, label: `11-20 ${f}`},
      {id: 4, value: 0, label: `21-40 ${f}`},
      {id: 5, value: 0, label: `41+ ${f}`}
    ];

    books.forEach((book) => {
      let x = book.weeks_on_list;
      if (x === 0) freqs[0].value += 1;
      else if (x > 0 && x < 6) freqs[1].value += 1;
      else if (x > 5 && x < 11) freqs[2].value += 1;
      else if (x > 10 && x < 21) freqs[3].value += 1;
      else if (x > 20 && x < 41) freqs[4].value += 1;
      else freqs[5].value += 1;
    });

    let ret = [];
    freqs.forEach((item) => {
      if (item.value !== 1) {
        ret = [...ret, item];
      }
    });
    return ret;
  }


  return (
   <div className="container-fluid">
      <div className="con">
        <div className="bg">
          <h1> NYT Book Finder </h1>
          <hr className="big-div"></hr>
          <div className="row inputs">
            <div className="col-6">
              <Select 
                  options={
                  data.sort( (a,b) => a.category > b.category ? 1 : -1)
                      .map(item => ({
                        value: item.key,
                        label: item.category
                      })
                  )}
                  onChange={selectedOption => setSelectedCategory(selectedOption)}
                /> 
            </div>
            <div className="col-6">
              <div>
                {/* https://reactdatepicker.com/#example-custom-header */}
                <DatePicker 
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div id="date-picker-header">
                      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                      </button>
                      <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(value)}
                      >
                        {years.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        value={months[getMonth(date)]}
                        onChange={({ target: { value } }) =>
                          changeMonth(months.indexOf(value))
                        }
                      >
                        {months.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <button 
                        onClick={increaseMonth} 
                        disabled={nextMonthButtonDisabled}>
                        {">"}
                      </button>
                    </div>
                  )}              
                  selected={selectedDate} 
                  onChange={date => setSelectedDate(date)}
                  showIcon
                  minDate={mnDate}
                  maxDate={mxDate} 
                  allowInput={true}
                  />
                </div>
            </div>
          </div>
          <div className="submit-button">
              <button 
                type="button" 
                className="btn btn-primary btn-lg full-block" 
                disabled={!selectedCategory} 
                onClick={findBestsellers}>Find Bestsellers!</button>
          </div>
          {books.length !== 0 && (
            <div className='pie-chart pie-bg'>
              <PieChart 
                series = {[
                  {
                    data: getFrequencies(),
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    startAngle: -180,
                    endAngle: 180
                  }
                ]}
                height={300}
              />
            </div>
          )}
          <hr className="big-div"></hr>
          <div className="results">
              {books.map((book, index) => {
                return (
                  <div key={`book-${index}`} className="Book">
                    <Book 
                      title={book.title} 
                      author={book.author}
                      summary={book.description}
                      imgPath={book.book_image}
                      purchaseLinks={book.buy_links}
                      weekCount={book.weeks_on_list}/>
                    <hr className="half"></hr>
                  </div>
                );
              })
              }
          </div>
        </div> 
      </div>
    </div>
  );


}

export default App;
