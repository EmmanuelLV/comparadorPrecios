import React, {useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {Colors} from "react-native/Libraries/NewAppScreen";

const CustomPicker = ({ options, selectedValue, onValueChange }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const togglePicker = () => setIsOpen(!isOpen);

  const handleSelect = (value) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
      <View>
        <TouchableOpacity onPress={togglePicker} style={{borderBottomColor:'gray',borderBottomWidth:1, width:70,}}>
          <Text style={{textAlign: 'center', fontSize:18,color: isDarkMode? '#a1a1a1':'#323232',}}>{selectedValue || 'Select an Option'}</Text>
        </TouchableOpacity>
        {isOpen && (
            <View style={{ position: 'absolute', top: 10, backgroundColor:  isDarkMode ? "#000000" : "#ffffff", padding: 10, zIndex:5, borderColor: "gray", borderWidth:1}}>
              {options.map((option) => (
                  <TouchableOpacity key={option.value} onPress={() => handleSelect(option.value)} style={{paddingTop:10}} >
                    <Text style={{fontSize:20, color: isDarkMode? '#a1a1a1':'#323232',}}>{option.label}</Text>
                  </TouchableOpacity>
              ))}
            </View>
        )}
      </View>
  );
};

interface IItem {
  mlOrGr: string;
  cantidad: string;
  precio: string;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = createStyles(isDarkMode);
  const inputRefs = useRef([]);
  const [items, setItems] = useState<IItem[]>([
    {mlOrGr: 'ml', cantidad: '', precio: ''},
    {mlOrGr: 'ml', cantidad: '', precio: ''},
  ]);
  const [selectedUnit, setSelectedUnit] = useState('ml');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#000000" : "#ffffff",
  };

  const handleChange = (index: number, key: keyof IItem, value: string) => {
    const updatedItems = [...items];
    updatedItems[index][key] = value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, {mlOrGr: 'ml', cantidad: '', precio: ''}]);
    const lastItemIndex = items.length;
    setTimeout(() => {
        inputRefs.current[lastItemIndex][0].focus();
    }, 100);
  };
  const handleResetItems = () => {
    setItems([
      {mlOrGr: 'ml', cantidad: '', precio: ''},
      {mlOrGr: 'ml', cantidad: '', precio: ''},
    ]);
  };

  const calculateCheaper = () => {
    let minPricePerUnit = Infinity;
    let minIndex = -1;

    items.forEach((item, index) => {
      if (item.cantidad && item.precio) {
        const pricePerUnit = parseFloat(item.precio) / parseFloat(item.cantidad);
        if (pricePerUnit < minPricePerUnit) {
          minPricePerUnit = pricePerUnit;
          minIndex = index;
        }
      }
    });

    return minIndex;
  };
  const itemStyle = (index: number) => {
    const cheaper = calculateCheaper();
    if (index === cheaper) {
      return [styles.cheaperItem,true]
    }
    if (items[index].cantidad !== '' && items[index].precio !== '') {
      return [styles.itemExpensive,false];
    }
    return [styles.itemContainer,null];
  }
  const focusNextField = (index: number, subIndex: number) => {
    // Calculate the index of the next input
    const nextSubIndex = subIndex === 1 ? 0 : 1; // Switch to the first input of the next item
    const nextIndex = subIndex === 1 ? index + 1: index;

    // Check if there are more inputs
    if (inputRefs.current[nextIndex]) {
      if (inputRefs.current[nextIndex][nextSubIndex] !== null && inputRefs.current[nextIndex][nextSubIndex] !== undefined) {
        try {
          inputRefs.current[nextIndex][nextSubIndex].focus();
          return
        } catch (error) {
          console.error('Error focusing next input:', error);
        }
      }
    }
    handleAddItem()
    };
  const handleKeyPress = (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number,
      subIndex: number,
  ) => {
    if (event.nativeEvent.key === 'Enter') {
      focusNextField(index, subIndex);
    }
  };
  const options = [
    {label:"Milliliters (ml)", value:"ml"},
    {label:"Grams (gr)", value:"gr"},
    {label:"Kilograms (kg)", value:"kg"},
    {label:"Contenedor", value:"cc"},
  ];

  return (
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
        />
        <View
            style={{
              backgroundColor: backgroundStyle.backgroundColor
            }}>
          <View style={styles.container}>
            <Text style={styles.title}>Comparador de precios</Text>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.unit}>
                Unidad básica:
              </Text>
              <CustomPicker
                  options={options}
                  selectedValue={selectedUnit}
                  onValueChange={(value) => setSelectedUnit(value)}
              />
            </View>
            <View style={styles.inputTitleContainer}>
              <Text style={styles.inputTitle}>Cantidad</Text>
              <Text style={styles.inputTitle}>Precio</Text>
            </View>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={[backgroundStyle]}>
              {items.map((item, index) => {
                const [itemStyles,isCheaper] = itemStyle(index)
                return (
                    <View key={index} style={itemStyles}>
                      <View style={styles.itemTop}>
                      <Text style={styles.itemTitle}>{`Item ${index + 1}`}</Text>
                      {
                        isCheaper && (
                            <View style={{backgroundColor: '#00b300', padding: 5, borderRadius:5}}>
                                <Text style={{color:"white"}}>Baratisimoo</Text>
                            </View>
                          )
                      }
                        {
                            isCheaper === false && (
                                <View style={{backgroundColor: '#b30000', padding: 5, borderRadius:5}}>
                                  <Text style={{color:"white"}}>ta caro</Text>
                                </View>
                            )
                        }
                      </View>
                      <View style={styles.inputContainer}>
                        <View style={styles.input}>
                          <TextInput
                              ref={ref => (inputRefs.current[index] = [ref])}
                              style={styles.listInput}
                              value={item.cantidad}
                              onChangeText={text =>
                                  handleChange(index, 'cantidad', text)
                              }
                              placeholder="Cantidad"
                              keyboardType="numeric"
                              onSubmitEditing={() => focusNextField(index, 0)}
                              onKeyPress={event => handleKeyPress(event, index, 0)}
                          />
                          <Text style={styles.dollar}>{selectedUnit}</Text>
                        </View>
                        <View style={styles.input}>
                          <Text style={styles.dollar}>$</Text>
                          <TextInput
                              ref={ref => (inputRefs.current[index][1] = ref)}
                              style={styles.listInput}
                              value={item.precio}
                              onChangeText={text => handleChange(index, 'precio', text)}
                              placeholder="Precio"
                              keyboardType="numeric"
                              onSubmitEditing={() => focusNextField(index, 1)}
                              onKeyPress={event => handleKeyPress(event, index, 1)}
                          />
                        </View>
                      </View>
                    </View>
                )
              })}
              <View style={{height:150}}></View>
            </ScrollView>
            <View style={styles.btnLayout}>
              <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetItems} style={styles.addButton}>
                <Text style={styles.addButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
  );
}
const colors = {
    dark: {
      text:'#a1a1a1',
      itemBorder: '#a1a1a1',
      contrast: '#142d69',
      contrastText: '#a8a8a8',
    },
    light: {
      text:'#3d3d3d',
      itemBorder: 'gray',
      contrast: '#5877bd',
      contrastText: 'white',
    },
}
const createStyles = (isDark: boolean) => StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    // flex: 1,
    height: '100%',
    width: '100%',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    color: isDark ? colors.dark.text : colors.light.text,
  },
  itemContainer: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: isDark ? colors.dark.itemBorder : colors.light.itemBorder,
    padding: 10,
    borderRadius: 5,
  },
  itemExpensive: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#b30000',
    padding: 10,
    borderRadius: 5,
  },
  cheaperItem: {
    marginBottom: 20,
    padding: 10,
    borderColor: '#00b300',
    borderWidth: 2,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inputTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: isDark ? colors.dark.text : colors.light.text,
  },
  dollar: {
    textAlignVertical: 'center',
    paddingRight: 5,
    color: isDark ? colors.dark.text : colors.light.text,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'gray',
    padding: 5,
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  btnLayout:{
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: isDark ? colors.dark.contrast : colors.light.contrast,
  },
  unit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? colors.dark.text : colors.light.text,
  },
  itemTop: {flexDirection: 'row', justifyContent: 'space-between'},
  itemTitle: {
    color: isDark ? colors.dark.text : colors.light.text,
  },
  listInput: {
    flex: 1,
    color: isDark ? colors.dark.text : colors.light.text,
  },
  addButtonText: {
    color: isDark ? colors.dark.contrastText : colors.light.contrastText,
  }

});

export default App;
