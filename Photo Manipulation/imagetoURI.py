#first resize then get URI string
import os, base64, csv, re
#from PIL import Image

# folder_array = ['']   -> building array list
# img_folder = ""  -> folder of images

#loop through given image folder


    
with open('all_students.csv', 'w', newline='') as csvfile:
    fieldnames = ['KRSD_ID', 'b64_String']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    #for folder in folder_array:
    all_images = os.listdir(img_folder)
    for image in all_images:
           
        img_binary = open(img_folder + image, 'rb')
        image_read = img_binary.read()
        image_64_encode = base64.encodestring(image_read)
        #print(len(image_64_encode))
        #image_64_encode.decode("utf-8") 

                                    #need to match on filename without extension, not image[0:5]
        
    #data_uri = open(img_folder+"\\" + image, "rb").read().encode("base64").replace("\\n", "")
        writer.writerow({'KRSD_ID': image.split('.')[0], 'b64_String': image_64_encode.decode("utf-8").replace('\n','')})
    

#after image processing(resize), create a dictionary filename: URI
"""
with open('K.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['KRSD_ID'] in ['13984', '14222']:
            print(len(row['b64_String']))

    for row in reader:
        print(row['KRSD_ID'], row['b64_String'])
        """
